import { Injectable } from '@angular/core';
import { VoucherEligibleProduct } from '../../../models';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class VoucherEligibleProductSettingsService {
    value$: BehaviorSubject<VoucherEligibleProduct> = new BehaviorSubject<
        VoucherEligibleProduct
    >(null);

    constructor() {}

    getValue(): Observable<VoucherEligibleProduct> {
        return this.value$.asObservable();
    }

    setValue(value: VoucherEligibleProduct): void {
        this.value$.next(value);
    }
}
