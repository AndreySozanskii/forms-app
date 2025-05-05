import {
  Directive,
  ElementRef,
  inject,
  Input,
  OnDestroy,
  OnInit,
  Renderer2,
} from '@angular/core';
import { NgControl } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

@Directive({
  selector: '[appValidationMessage]',
})
export class ValidationMessageDirective implements OnInit, OnDestroy {
  private el = inject(ElementRef);
  private control = inject(NgControl);
  private renderer = inject(Renderer2);

  @Input('appValidationMessage') public fieldName: string = '';

  private ngUnsubscribe$ = new Subject<void>();

  public ngOnInit(): void {
    const parent = this.el.nativeElement.parentElement;
    const errorId = `${this.fieldName}-error`;

    const updateErrors = () => {
      const controlInvalid = this.control.invalid && this.control.touched;
      let errorMsgEl = parent.querySelector(`#${errorId}`);

      if (controlInvalid) {
        if (!errorMsgEl) {
          errorMsgEl = this.createErrorMessageEl(parent, errorMsgEl, errorId);
        } else {
          errorMsgEl.innerHTML = '';
        }

        this.createErrorMessages(errorMsgEl);

        this.renderer.addClass(this.el.nativeElement, 'is-invalid');
      } else {
        if (errorMsgEl) this.renderer.removeChild(parent, errorMsgEl);
        this.renderer.removeClass(this.el.nativeElement, 'is-invalid');
      }
    };

    this.control.statusChanges
      ?.pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe(updateErrors);
    this.renderer.listen(this.el.nativeElement, 'blur', updateErrors);
  }

  private createErrorMessageEl(
    parent: any,
    errorMsgEl: any,
    errorId: string,
  ): any {
    errorMsgEl = this.renderer.createElement('ul');
    this.renderer.setAttribute(errorMsgEl, 'id', errorId);
    this.renderer.addClass(errorMsgEl, 'text-danger');
    this.renderer.addClass(errorMsgEl, 'mt-1');
    this.renderer.appendChild(parent, errorMsgEl);
    return errorMsgEl;
  }

  private createErrorMessages(errorMsgEl: any): void {
    const errors = this.control.errors || {};

    for (const key of Object.keys(errors)) {
      const li = this.renderer.createElement('li');
      const message = this.getErrorMessage(key);
      const text = this.renderer.createText(message);
      this.renderer.addClass(li, 'text-red-500');
      this.renderer.appendChild(li, text);
      this.renderer.appendChild(errorMsgEl, li);
    }
  }

  private getErrorMessage(errorKey: string): string {
    switch (errorKey) {
      case 'required':
        return `${this.fieldName} is required.`;
      case 'invalidCountry':
        return `Invalid country selected.`;
      case 'futureDate':
        return `Date cannot be in the future.`;
      case 'usernameTaken':
        return `Username is already taken.`;
      default:
        return `Invalid ${this.fieldName}.`;
    }
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
