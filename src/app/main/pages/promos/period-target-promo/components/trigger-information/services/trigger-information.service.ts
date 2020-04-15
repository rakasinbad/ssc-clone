import { Injectable } from '@angular/core';
import { PeriodTargetPromoTriggerInformation } from '../../../models';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class PeriodTargetPromoTriggerInformationService {
    value$: BehaviorSubject<PeriodTargetPromoTriggerInformation> = new BehaviorSubject<PeriodTargetPromoTriggerInformation>(null);

    constructor() { }

    getValue(): Observable<PeriodTargetPromoTriggerInformation> {
        return this.value$.asObservable();
    }

    setValue(value: PeriodTargetPromoTriggerInformation): void {
        this.value$.next(value);
    }
}
