import { Injectable, OnDestroy } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { CheckAvailabilityWarehouseCoverageResponse } from '../models/warehouse-coverage.model';

@Injectable({
    providedIn: 'root'
})
export class WarehouseCoverageService implements OnDestroy {
    urbanId$: BehaviorSubject<CheckAvailabilityWarehouseCoverageResponse> = new BehaviorSubject<CheckAvailabilityWarehouseCoverageResponse>(null);

    constructor() {}

    getUrbanSubject(): Observable<CheckAvailabilityWarehouseCoverageResponse> {
        return this.urbanId$.asObservable();
    }

    updateUrban(payload: CheckAvailabilityWarehouseCoverageResponse): void {
        this.urbanId$.next(payload);
    }

    ngOnDestroy(): void {
        this.urbanId$.next(null);
        this.urbanId$.complete();
    }
}
