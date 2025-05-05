import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { delay, Observable, of, tap } from 'rxjs';

export const mockBackendInterceptor: HttpInterceptorFn = (
  req,
  next,
): Observable<any> => {
  if (req.url.endsWith('/api/checkUsername') && req.method === 'POST') {
    // @ts-ignore
    const isAvailable: boolean = req.body?.username.includes('new');
    const response = new HttpResponse({ status: 200, body: { isAvailable } });

    return of(response).pipe(
      delay(500),
      tap(() => console.log('checkUsername response:', { isAvailable })),
    );
  }

  if (req.url.endsWith('/api/submitForm') && req.method === 'POST') {
    const response = new HttpResponse({
      status: 200,
      body: { result: 'nice job' },
    });

    return of(response).pipe(
      delay(500),
      tap(() => console.log('submitForm response')),
    );
  }

  return of(
    new HttpResponse({
      status: 404,
      body: { result: 'You are using the wrong endpoint' },
    }),
  );
};
