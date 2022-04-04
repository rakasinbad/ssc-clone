import { DataSource } from '@angular/cdk/collections';
import { IQueryParams } from 'app/shared/models/query.model';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { tap, withLatestFrom, take, catchError, switchMap } from 'rxjs/operators';
import { IPaginatedResponse, ErrorHandler } from 'app/shared/models/global.model';
import { fromAuth } from 'app/main/pages/core/auth/store/reducers';
import { HelperService } from 'app/shared/helpers';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { UserSupplier } from 'app/shared/models/supplier.model';
import { Store as NgRxStore } from '@ngrx/store';
import { StoreSegmentationTypesApiService as EntitiesApiService } from 'app/shared/components/selection-tree/store-segmentation/services';
import { StoreSegmentationType as Entity } from 'app/shared/components/selection-tree/store-segmentation/models';
import { SelectionTree } from 'app/shared/components/selection-tree/selection-tree/models';

export class CatalogueMssSettingsDataSource implements DataSource<any> {
    data: BehaviorSubject<any[]> = new BehaviorSubject([]);
    isLoading: BehaviorSubject<boolean> = new BehaviorSubject(false);
    total: BehaviorSubject<number> = new BehaviorSubject(0);

    constructor(
		private store: NgRxStore<fromAuth.FeatureState>,
        private entityApi$: EntitiesApiService,
        private helper$: HelperService,
	) {}

    getTableData(params: IQueryParams): void {
        of(null).pipe(
            // tap(x => HelperService.debug('DELAY 1 SECOND BEFORE GET USER SUPPLIER FROM STATE', x)),
            // delay(1000),
            withLatestFrom<any, UserSupplier>(
                this.store.select<UserSupplier>(AuthSelectors.getUserSupplier)
            ),
            tap(x => HelperService.debug('GET USER SUPPLIER FROM STATE', x)),
            switchMap<[null, UserSupplier], Observable<IPaginatedResponse<Entity>>>(([_, userSupplier]) => {
                if (!userSupplier) {
                    throw new Error('ERR_USER_SUPPLIER_NOT_FOUND');
                }

                const { supplierId } = userSupplier;
                const newQuery: IQueryParams = { ... params };
                newQuery['supplierId'] = supplierId;
                newQuery['segmentation'] = 'cluster';


                this.isLoading.next(true);
                return this.entityApi$
                    .find<IPaginatedResponse<Entity>>(newQuery)
                    .pipe(
                        tap(response => HelperService.debug('FIND ENTITY', { params: newQuery, response }))
                    );
            }),
            take(1),
            catchError(err => { throw err; }),
        )
        .subscribe({
            next: (response) => {
                this.data.next(response.data as unknown as Array<SelectionTree>);
                this.total.next(response.total); 
                this.isLoading.next(false);
            },
            error: (err) => {
                HelperService.debug('ERROR FIND ENTITY', { params, error: err }),
                this.helper$.showErrorNotification(new ErrorHandler(err));
            },
            complete: () => {
                HelperService.debug('FIND ENTITY COMPLETED');
            }
        });
    }

    connect(): Observable<any> {
		return this.data.asObservable();
    }

    disconnect(): void {
        this.data.next([]);
        this.data.complete();

        this.isLoading.next(false);
        this.isLoading.complete();

        this.total.next(0);
        this.total.complete();
    }
}
