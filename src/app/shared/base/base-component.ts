import { Subject } from 'rxjs';
import { Directive, OnDestroy } from '@angular/core';

@Directive()
export abstract class BaseComponent implements OnDestroy {
  protected readonly ngUnsubscribe$ = new Subject<void>();

  public unsubscribe(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }

  public ngOnDestroy(): void {
    this.unsubscribe();
  }
}
