import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import { Store } from '@ngrx/store';
import { District } from 'app/shared/models/location.model';
import { IQueryParams } from 'app/shared/models/query.model';
import { DropdownActions } from 'app/shared/store/actions';
import { DropdownSelectors } from 'app/shared/store/selectors';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { fromMerchant } from '../store/reducers';

export class DistrictDataSource extends DataSource<District | undefined> {
    search: string;

    private _pageSize = 5;
    private _lastPage = 0;
    private _dataStream = new BehaviorSubject<Array<District | undefined>>([]);
    private _unSubs$ = new Subject();

    constructor(private store: Store<fromMerchant.FeatureState>) {
        super();

        // this.getData();
    }

    connect(collectionViewer: CollectionViewer): Observable<Array<District | undefined>> {
        collectionViewer.viewChange.pipe(takeUntil(this._unSubs$)).subscribe(ev => {
            console.log('CONNECT 1', ev);

            const currentPage = this.getPageIndex(ev.end);

            if (currentPage > this._lastPage) {
                this._lastPage = currentPage;
                // this.fetchData(this._lastPage * this._pageSize);
            }

            console.log('CONNECT 2', currentPage);

            console.log('CONNECT 3', this._lastPage);
        });

        return this.store.select(DropdownSelectors.getAllDistrict);
    }

    disconnect(collectionViewer: CollectionViewer): void {
        this._unSubs$.next();
        this._unSubs$.complete();
    }

    private getData(): void {
        this.store
            .select(DropdownSelectors.getAllDistrict)
            .pipe(takeUntil(this._unSubs$))
            .subscribe(res => {
                this._dataStream.next(res);
            });
    }

    private fetchData(skip: number) {
        const data: IQueryParams = {
            limit: 5,
            skip: skip
        };

        data['paginate'] = true;

        if (this.search) {
            data['search'] = [
                {
                    fieldName: 'keyword',
                    keyword: this.search
                }
            ];

            this.store.dispatch(DropdownActions.fetchScrollDistrictRequest({ payload: data }));
        }
    }

    private getPageIndex(i: number): number {
        return Math.floor(i / this._pageSize);
    }
}
