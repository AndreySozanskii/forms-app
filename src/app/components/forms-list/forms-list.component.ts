import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  signal,
  WritableSignal,
} from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  ReactiveFormsModule,
} from '@angular/forms';
import { AsyncPipe } from '@angular/common';
import { FormCardComponent } from './form-card/form-card.component';
import {
  interval,
  Observable,
  startWith,
  take,
  takeUntil,
  takeWhile,
  tap,
} from 'rxjs';
import { FormDataModel } from '@models/form-data.model';
import { map } from 'rxjs/operators';
import { FormSubmitService } from '@services/http';
import { BaseComponent } from '@shared/base';

@Component({
  selector: 'app-forms-list',
  imports: [ReactiveFormsModule, FormCardComponent, AsyncPipe],
  providers: [FormSubmitService],
  templateUrl: './forms-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormsListComponent extends BaseComponent {
  private formBuilder: FormBuilder = inject(FormBuilder);
  private formSubmitService: FormSubmitService = inject(FormSubmitService);
  private cdr: ChangeDetectorRef = inject(ChangeDetectorRef);

  public formGroup = this.formBuilder.group({
    forms: this.formBuilder.array([]),
  });

  public timer: WritableSignal<number> = signal(5);
  public isSubmitting: WritableSignal<boolean> = signal(false);

  get forms(): FormArray {
    return this.formGroup.get('forms') as FormArray;
  }

  public invalidFormsCount$: Observable<number> =
    this.formGroup.valueChanges.pipe(
      startWith(this.formGroup.value),
      takeUntil(this.ngUnsubscribe$),
      map(() => {
        return this.forms.controls.filter(
          (ctrl) =>
            (ctrl?.value?.includes && ctrl?.value?.includes?.('INVALID')) ||
            ctrl.pristine,
        ).length;
      }),
    );

  public addForm(): void {
    if (this.forms.length < 10) {
      const control = this.formBuilder.control<FormDataModel | null>(null);
      this.forms.push(control);
    }
  }

  public removeForm(index: number): void {
    this.forms.removeAt(index);
  }

  public submitAll(): void {
    if (this.isSubmitting()) {
      return;
    }

    this.isSubmitting.set(true);
    this.disableForms();
    this.startTimer();
  }

  public cancelSubmit(): void {
    this.unsubscribe();
    this.isSubmitting.set(false);
    this.enableForms();
  }

  private startTimer(): void {
    this.timer.set(5);

    interval(1000)
      .pipe(
        takeUntil(this.ngUnsubscribe$),
        takeWhile(() => this.timer() > 0),
        tap(() => {
          const current = this.timer();

          if (current <= 1) {
            this.enableForms();
            this.finalSubmit();
          } else {
            this.timer.update(() => current - 1);
          }
        }),
      )
      .subscribe();
  }

  private enableForms(): void {
    this.forms.controls.forEach((control: AbstractControl) => {
      control.enable();
    });
  }

  private disableForms(): void {
    this.forms.controls.forEach((control: AbstractControl) => {
      control.disable();
    });
  }

  private resetFormGroup(): void {
    this.formGroup = this.formBuilder.group({
      forms: this.formBuilder.array([]),
    });
  }

  private finalSubmit(): void {
    this.isSubmitting.set(false);
    const payload = this.forms.value;

    this.formSubmitService
      .submitForm(payload)
      .pipe(take(1))
      .subscribe(() => {
        this.resetFormGroup();
        this.cdr.markForCheck();
      });

    this.unsubscribe();
  }
}
