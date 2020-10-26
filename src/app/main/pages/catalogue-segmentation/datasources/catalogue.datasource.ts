import { DataSource } from '@angular/cdk/collections';
import { BehaviorSubject, Observable } from 'rxjs';

export class CatalogueDataSource implements DataSource<any> {
    private sample = [
        {
            id: '1',
            name: 'SNB-CATALOGUE',
            sinbadId: '30546',
            supplierId: '1212',
            type: 'Regular',
            status: 'active',
        },
        {
            id: '2',
            name: 'FREE 1 MOLTO PARFUM (SETIAP PEMBELIAN RINSO LIQUID/POWDER)',
            sinbadId: '30547',
            supplierId: '1213',
            type: 'Regular',
            status: 'inactive',
        },
    ];
    private sources$: BehaviorSubject<any> = new BehaviorSubject([]);

    total = this.sample.length;

    constructor() {}

    getAll(): void {
        this.sources$.next(this.sample);
    }

    connect(): Observable<any> {
        return this.sources$.asObservable();
    }

    disconnect(): void {}
}
