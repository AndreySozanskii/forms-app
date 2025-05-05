import {
  ChangeDetectionStrategy,
  Component,
  forwardRef,
  inject,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import {
  AbstractControl,
  AsyncValidatorFn,
  ControlValueAccessor,
  FormBuilder,
  FormControl,
  FormGroup,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { CountryEnum } from '@shared/enum';
import { ValidationMessageDirective } from '@shared/directives';
import { UsernameValidationService } from '@services/validators';
import { Observable, Subject, takeUntil } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  standalone: true,
  selector: 'app-form-card',
  templateUrl: './form-card.component.html',
  imports: [ReactiveFormsModule, ValidationMessageDirective],
  providers: [
    UsernameValidationService,
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FormCardComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormCardComponent
  implements ControlValueAccessor, OnInit, OnDestroy
{
  private fb = inject(FormBuilder);
  private usernameService = inject(UsernameValidationService);

  @Input() public index!: number;

  public form!: FormGroup;
  public countryEnum = Object.values(CountryEnum);
  public isDisabled = false;

  private ngUnsubscribe$ = new Subject<void>();

  private onChange = (_: any) => {};
  private onTouched = () => {};

  public ngOnInit(): void {
    this.form = this.fb.group({
      country: ['', [Validators.required, this.countryValidator.bind(this)]],
      username: ['', [Validators.required], [this.usernameAsyncValidator()]],
      birthday: ['', [Validators.required, this.dateValidator]],
    });

    this.form.statusChanges
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe((value) => {
        this.onChange(value);
        if (this.form.valid) {
          this.onChange(this.form.value);
        }
      });
  }

  public usernameAsyncValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      return this.usernameService.checkUsername(control.value).pipe(
        map((isAvailable) => {
          return isAvailable ? null : { usernameTaken: true };
        }),
      );
    };
  }

  public writeValue(value: any): void {
    if (value) {
      console.log(value);
      this.form.patchValue(value, { emitEvent: false });
    }
  }

  public registerOnChange(callback: any): void {
    this.onChange = callback;
  }

  public registerOnTouched(callback: any): void {
    this.onTouched = callback;
  }

  public setDisabledState?(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
    isDisabled ? this.form.disable() : this.form.enable();
  }

  public countryValidator(
    control: FormControl,
  ): { invalidCountry: boolean } | null {
    return this.countryEnum.includes(control.value)
      ? null
      : { invalidCountry: true };
  }

  public dateValidator(control: FormControl): { futureDate: true } | null {
    const inputDate = new Date(control.value);
    return inputDate <= new Date() ? null : { futureDate: true };
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
