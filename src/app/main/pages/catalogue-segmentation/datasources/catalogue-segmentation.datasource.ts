import { DataSource } from '@angular/cdk/collections';
import { BehaviorSubject, Observable } from 'rxjs';

export class CatalogueSegmentationDataSource implements DataSource<any> {
    private sample = [
        {
            id: '1',
            name: 'Group Segment 1',
            warehouses: 'DC Cibinong (+2 others)',
            types: 'Laundry (+2 others)',
            groups: 'Matahari (+2 others)',
            channels: 'B (+2 others)',
            clusters: 'Hypermarket (+2 others)',
            status: 'active',
        },
        {
            id: '2',
            name: 'Group Segment 2',
            warehouses: 'DC Cibinong',
            types: '',
            groups: 'Matahari',
            channels: '',
            clusters: '',
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
