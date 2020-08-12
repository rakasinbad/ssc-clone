import {
    ChangeDetectionStrategy,
    Component,
    Inject,
    OnDestroy,
    OnInit,
    ViewEncapsulation
} from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';
import { fuseAnimations } from '@fuse/animations';
import { Store as NgRxStore } from '@ngrx/store';
import { Store } from 'app/main/pages/accounts/merchants/models';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Portfolio } from '../../../portfolios/models';
import { StoreActions } from '../../../portfolios/store/actions';
import { CoreFeatureState as PortfolioCoreFeatureState } from '../../../portfolios/store/reducers';
import { StoreSelector } from '../../../portfolios/store/selectors';

@Component({
    selector: 'app-portfolio-stores',
    templateUrl: './portfolio-stores.component.html',
    styleUrls: ['./portfolio-stores.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PortfolioStoresComponent implements OnInit, OnDestroy {
    // Untuk keperluan unsubscribe.
    private subs$: Subject<void> = new Subject<void>();

    // Untuk menyimpan daftar store.
    stores$: Observable<Array<Store>>;

    // Untuk menyimpan nama-nama kolom yang ingin ditampilkan.
    displayedColumns: Array<string> = ['code', 'name', 'segment', 'type'];

    constructor(
        @Inject(MAT_DIALOG_DATA) readonly dialogData: Portfolio,
        private shopStore: NgRxStore<PortfolioCoreFeatureState>
    ) {}

    ngOnInit(): void {
        // this.stores$ = this.shopStore
        //     .select(StoreSelector.getAllStores)
        //     .pipe(takeUntil(this.subs$));
    }

    ngOnDestroy(): void {
        this.shopStore.dispatch(StoreActions.truncateAllStores());

        this.subs$.next();
        this.subs$.complete();
    }
}
