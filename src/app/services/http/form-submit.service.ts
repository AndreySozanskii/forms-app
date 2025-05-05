import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SubmitFormResponseData } from '@models/response.model';
import { FormDataModel } from '@models/form-data.model';

@Injectable()
export class FormSubmitService {
  private http = inject(HttpClient);

  private readonly apiUrl = '/api/submitForm';

  submitForm(data: FormDataModel[]): Observable<SubmitFormResponseData> {
    return this.http.post<SubmitFormResponseData>(this.apiUrl, data);
  }
}
