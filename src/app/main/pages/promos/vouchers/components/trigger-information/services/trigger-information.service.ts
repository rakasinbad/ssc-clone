import { Injectable } from '@angular/core';
import { VoucherTriggerInformation } from '../../../models';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class VoucherTriggerInformationService {
    value$: BehaviorSubject<VoucherTriggerInformation> = new BehaviorSubject<
        VoucherTriggerInformation
    >(null);

    constructor() {}

    getValue(): Observable<VoucherTriggerInformation> {
        return this.value$.asObservable();
    }

    setValue(value: VoucherTriggerInformation): void {
        this.value$.next(value);
    }
}
