import { Injectable } from '@angular/core';
import { HelperService } from 'app/shared/helpers';
import { IQueryParams } from 'app/shared/models/query.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { OrderStatusApiService } from './order-status-api.service';

@Injectable({
  providedIn: 'root'
})
export class WarehouseFacadeService {

  private _collections$: BehaviorSubject<any[]> = new BehaviorSubject([]);
  private _loading$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  readonly collections$: Observable<any[]> = this._collections$.asObservable();
  readonly loading$: Observable<boolean> = this._loading$.asObservable();

  constructor(
    private orderStatusApiService: OrderStatusApiService
  ) {}

  getWithQuery(params: IQueryParams): void {
    this._loading$.next(true);

    this.orderStatusApiService.getWithQuery<any>(params).subscribe((value) => {
      this._collections$.next(value);
      this._loading$.next(false);
    });
  }
}
