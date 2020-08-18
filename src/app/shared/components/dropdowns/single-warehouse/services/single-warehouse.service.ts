import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Warehouse } from '../models';

@Injectable({
    providedIn: 'root'
})
export class SingleWarehouseDropdownService implements OnDestroy {

    private message: BehaviorSubject<Warehouse> = new BehaviorSubject<Warehouse>(null);

    constructor() {}

    getSelectedWarehouse(): Observable<Warehouse> {
        return this.message.asObservable();
    }

    selectWarehouse(warehouse: Warehouse): void {
        this.message.next(warehouse);
    }

    ngOnDestroy(): void {
        this.message.next(null);
        this.message.complete();
    }
}
