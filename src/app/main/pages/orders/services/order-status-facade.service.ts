import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { OrderStatusSource } from '../models/order-status.model';
import { OrderStatusApiService } from './order-status-api.service';

@Injectable({
  providedIn: 'root'
})
export class OrderStatusFacadeService {

  private _collections$: BehaviorSubject<OrderStatusSource[]> = new BehaviorSubject([]);
  private _loading$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  readonly collections$: Observable<OrderStatusSource[]> = this._collections$.asObservable();
  readonly loading$: Observable<boolean> = this._loading$.asObservable();

  constructor(
    private orderStatusApiService: OrderStatusApiService
  ) {}

  getWithQuery(): void {
    this._loading$.next(true);

  }
}
