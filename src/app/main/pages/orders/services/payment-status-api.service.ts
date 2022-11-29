import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HelperService } from 'app/shared/helpers';
import { IQueryParams } from 'app/shared/models/query.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PaymentStatusApiService {
  private url: string;
  private readonly endpoint: string = '/payment-status';

  constructor(private http: HttpClient, private helperService: HelperService) {
    this.url = this.helperService.handleApiRouter(this.endpoint);
}

  getWithQuery<T>() : Observable<T> {
    return this.http.get<T>(this.url);
  }
  
}
