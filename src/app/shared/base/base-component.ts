import { Subject } from 'rxjs';
import { OnDestroy } from '@angular/core';

export class BaseComponent implements OnDestroy {
  protected readonly ngUnsubscribe$ = new Subject<void>();

  public unsubscribe(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }

  public ngOnDestroy(): void {
    this.unsubscribe();
  }
}
