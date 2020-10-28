import { DataSource } from '@angular/cdk/collections';
import { Observable } from 'rxjs';

export class CataloguePriceSegmentationDataSource implements DataSource<any> {
    constructor() {}

    getAll(): void {}

    connect(): Observable<any> {
        return null;
    }

    disconnect(): void {}
}
