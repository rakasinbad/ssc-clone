import {
    ChangeDetectionStrategy,
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import { MatDialog } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { Store } from '@ngrx/store';
import { ShowImageComponent } from 'app/shared/modals/show-image/show-image.component';
import { SupplierStore } from 'app/shared/models/supplier.model';
import { User } from 'app/shared/models/user.model';
import { Observable, Subject } from 'rxjs';

import { Warehouse } from '../../models/warehouse.model';
import { StoreActions } from '../../store/actions';
import { fromMerchant } from '../../store/reducers';
import { StoreSelectors } from '../../store/selectors';

@Component({
    selector: 'app-merchant-info-detail',
    templateUrl: './merchant-info-detail.component.html',
    styleUrls: ['./merchant-info-detail.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MerchantInfoDetailComponent implements OnInit, OnDestroy {
    store$: Observable<SupplierStore>;
    isLoading$: Observable<boolean>;

    private _unSubs$: Subject<void> = new Subject<void>();

    constructor(
        private matDialog: MatDialog,
        private route: ActivatedRoute,
        private router: Router,
        private store: Store<fromMerchant.FeatureState>
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.

        const { id } = this.route.parent.snapshot.params;

        /* .pipe(
            withLatestFrom(this.store.select(AuthSelectors.getUserSupplier)),
            map(([store, userSupplier]) => {
                if (!userSupplier) {
                    this.router.navigateByUrl('/pages/account/stores');
                }

                return store;
            })
        ) */
        this.store$ = this.store.select(StoreSelectors.getSelectedStore);
        this.store.dispatch(StoreActions.fetchStoreRequest({ payload: id }));

        this.isLoading$ = this.store.select(StoreSelectors.getIsLoading);
    }

    ngOnDestroy(): void {
        // Called once, before the instance is destroyed.
        // Add 'implements OnDestroy' to the class.

        this.store.dispatch(StoreActions.resetStore());

        this._unSubs$.next();
        this._unSubs$.complete();
    }

    generateSalesRep(salesRep: Array<User>): string {
        if (!salesRep || !Array.isArray(salesRep) || salesRep.length === 0) {
            return '-';
        }

        return salesRep.map((salesRep) => salesRep.fullName).join(',<br/>');
    }

    generateWarehouse(warehouse: Warehouse[]): string {
        if (!warehouse || !Array.isArray(warehouse) || warehouse.length === 0) {
            return '-';
        }

        return warehouse.map((row) => `${row.code || '-'} (${row.name})`).join(',<br/>');
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    safeValue(item: any): any {
        return item ? item : '-';
    }

    onShowImage(imageUrl: string, title: string): void {
        this.matDialog.open(ShowImageComponent, {
            data: {
                title: title || '',
                url: imageUrl || '',
            },
            disableClose: true,
        });
    }
}
