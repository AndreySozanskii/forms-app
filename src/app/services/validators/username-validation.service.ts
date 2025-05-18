import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, debounceTime, map, switchMap } from 'rxjs/operators';
import { CheckUserResponseData } from '@models/response.model';

@Injectable()
export class UsernameValidationService {
  private http = inject(HttpClient);

  private readonly apiUrl = '/api/checkUsername';

  public checkUsername(username: string): Observable<boolean> {
    return of(username).pipe(
      debounceTime(500),
      switchMap((name) =>
        this.http.post<CheckUserResponseData>(this.apiUrl, {
          username: name,
        }),
      ),
      map((response) => response.isAvailable),
      catchError(() => of(false)),
    );
  }
}
