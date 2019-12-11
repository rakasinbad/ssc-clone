import {
    ChangeDetectionStrategy,
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation
} from '@angular/core';
import { MatDialog } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { Store } from '@ngrx/store';
import { LogService } from 'app/shared/helpers';
import { ShowImageComponent } from 'app/shared/modals/show-image/show-image.component';
import { SupplierStore } from 'app/shared/models';
import { Observable, Subject } from 'rxjs';

import { StoreActions } from '../../store/actions';
import { fromMerchant } from '../../store/reducers';
import { StoreSelectors } from '../../store/selectors';

@Component({
    selector: 'app-merchant-info-detail',
    templateUrl: './merchant-info-detail.component.html',
    styleUrls: ['./merchant-info-detail.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MerchantInfoDetailComponent implements OnInit, OnDestroy {
    store$: Observable<SupplierStore>;
    isLoading$: Observable<boolean>;

    private _unSubs$: Subject<void>;

    constructor(
        private matDialog: MatDialog,
        private route: ActivatedRoute,
        private router: Router,
        private store: Store<fromMerchant.FeatureState>,
        private _$log: LogService
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.

        this._unSubs$ = new Subject<void>();

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

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    safeValue(item: any): any {
        return item ? item : '-';
    }

    onShowImage(imageUrl: string, title: string): void {
        this._$log.generateGroup(`[SHOW IMAGE]`, {
            imageUrl: {
                type: 'log',
                value: imageUrl
            },
            title: {
                type: 'log',
                value: title
            }
        });

        this.matDialog.open(ShowImageComponent, {
            data: {
                title: title || '',
                url: imageUrl || ''
            },
            disableClose: true
        });
    }
}
