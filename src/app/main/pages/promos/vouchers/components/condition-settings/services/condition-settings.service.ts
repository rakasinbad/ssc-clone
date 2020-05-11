import { Injectable } from '@angular/core';
import { VoucherConditionSettings } from '../../../models';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class VoucherConditionSettingsService {
    value$: BehaviorSubject<VoucherConditionSettings> = new BehaviorSubject<
        VoucherConditionSettings
    >(null);

    constructor() {}

    getValue(): Observable<VoucherConditionSettings> {
        return this.value$.asObservable();
    }

    setValue(value: VoucherConditionSettings): void {
        this.value$.next(value);
    }
}
