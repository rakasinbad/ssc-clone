import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { SalesRep } from '../models';

@Injectable({
    providedIn: 'root'
})
export class SingleSalesRepDropdownService implements OnDestroy {

    private message: BehaviorSubject<SalesRep> = new BehaviorSubject<SalesRep>(null);

    constructor() {}

    getSelectedSalesRep(): Observable<SalesRep> {
        return this.message.asObservable();
    }

    selectSalesRep(value: SalesRep): void {
        this.message.next(value);
    }

    ngOnDestroy(): void {
        this.message.next(null);
        this.message.complete();
    }
}
