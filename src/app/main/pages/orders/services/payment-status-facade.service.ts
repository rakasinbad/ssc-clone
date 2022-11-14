import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { PaymentStatusApiService } from './payment-status-api.service';

@Injectable({
  providedIn: 'root'
})
export class PaymentStatusFacadeService {
  private _collections$: BehaviorSubject<any[]> = new BehaviorSubject([]);
  private _loading$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  readonly collections$: Observable<any[]> = this._collections$.asObservable();
  readonly loading$: Observable<boolean> = this._loading$.asObservable();

  constructor(
    private paymentStatusApiService: PaymentStatusApiService
  ) { }

  getWithQuery(): void {
    this._loading$.next(true);

    this.paymentStatusApiService.getWithQuery<any>().subscribe((value) => {
      this._collections$.next(value);
      this._loading$.next(false);
    });
  }
}
