import {
    ChangeDetectionStrategy,
    Component,
    Inject,
    OnDestroy,
    OnInit,
    ViewEncapsulation,
    AfterViewInit,
    ViewChild
} from '@angular/core';
import { MAT_DIALOG_DATA, MatPaginator, MatSort } from '@angular/material';
import { fuseAnimations } from '@fuse/animations';
import { Store as NgRxStore } from '@ngrx/store';
import { Store } from '../../models';
import { Observable, Subject, merge } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Portfolio } from '../../models';
import { StoreActions } from '../../store/actions';
import { FeatureState as CoreFeatureState } from '../../store/reducers';
import { StoreSelectors } from '../../store/selectors';
import { IQueryParams } from 'app/shared/models/query.model';
import { environment } from 'environments/environment';

@Component({
    selector: 'app-association-portfolio-stores',
    templateUrl: './portfolio-stores.component.html',
    styleUrls: ['./portfolio-stores.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PortfolioStoresComponent implements OnInit, AfterViewInit, OnDestroy {
    // Untuk keperluan unsubscribe.
    private subs$: Subject<void> = new Subject<void>();

    readonly defaultPageSize = environment.pageSize;
    readonly defaultPageOpts = environment.pageSizeTable;

    // Untuk menyimpan daftar store.
    stores$: Observable<Array<Store>>;
    totalStores$: Observable<number>;

    // Untuk menyimpan nama-nama kolom yang ingin ditampilkan.
    displayedColumns: Array<string> = [
        'code',
        'name',
        // 'segment',
        // 'type'
    ];

    @ViewChild(MatPaginator, { static: true })
    paginator: MatPaginator;

    @ViewChild(MatSort, { static: true })
    sort: MatSort;

    constructor(
        @Inject(MAT_DIALOG_DATA) readonly dialogData: Portfolio,
        private associationStore: NgRxStore<CoreFeatureState>
    ) {}

    requestStore(): void {
        const params: IQueryParams = {
            limit: this.paginator.pageSize || 5,
            paginate: true,
            skip: this.paginator.pageSize * this.paginator.pageIndex || 0,
        };

        params['portfolioId'] = this.dialogData.id;

        this.associationStore.dispatch(
            StoreActions.fetchStoresRequest({ payload: params })
        );
    }

    ngOnInit(): void {
        this.stores$ = this.associationStore.select(
            StoreSelectors.selectAll
        ).pipe(
            takeUntil(this.subs$)
        );
        
        this.totalStores$ = this.associationStore.select(
            StoreSelectors.getTotalItem
        ).pipe(
            takeUntil(this.subs$)
        );
    }

    ngAfterViewInit(): void {
        merge(
            this.sort.sortChange,
            this.paginator.page
        ).pipe(
            takeUntil(this.subs$)
        ).subscribe(() => {
            this.associationStore.dispatch(
                StoreActions.clearState()
            );

            this.requestStore();
        });

        this.requestStore();
    }

    ngOnDestroy(): void {
        this.associationStore.dispatch(StoreActions.clearState());

        this.subs$.next();
        this.subs$.complete();
    }
}
