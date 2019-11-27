import {
    ChangeDetectionStrategy,
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation
} from '@angular/core';
import { MatTableDataSource } from '@angular/material';
import { fuseAnimations } from '@fuse/animations';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { LogService } from 'app/shared/helpers';
import { IBreadcrumbs } from 'app/shared/models';
import { UiActions } from 'app/shared/store/actions';
import { UiSelectors } from 'app/shared/store/selectors';
import { Observable, Subject } from 'rxjs';

import { locale as english } from '../i18n/en';
import { locale as indonesian } from '../i18n/id';
import { OrderActions } from '../store/actions';
import { fromOrder } from '../store/reducers';
import { OrderSelectors } from '../store/selectors';
import { ActivatedRoute } from '@angular/router';
import { tap } from 'rxjs/operators';

@Component({
    selector: 'app-order-detail',
    templateUrl: './order-detail.component.html',
    styleUrls: ['./order-detail.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrderDetailComponent implements OnInit, OnDestroy {
    dataSource: MatTableDataSource<any>;
    displayedColumns = [
        'product',
        // 'bonus',
        'order-qty',
        'delivered-qty',
        'invoiced-qty',
        // 'unitOfMeasured',
        'unit-price',
        'gross'
        // 'amountDisc1',
        // 'amountDisc2',
        // 'amountDisc3',
        // 'promo',
        // 'amountPromo'
    ];

    order$: Observable<any>;
    smallBreadcrumbs$: Observable<IBreadcrumbs[]>;

    private _unSubs$: Subject<void>;

    constructor(
        private route: ActivatedRoute,
        private store: Store<fromOrder.FeatureState>,
        private _fuseTranslationLoaderService: FuseTranslationLoaderService,
        public translate: TranslateService,
        private _$log: LogService
    ) {
        this._fuseTranslationLoaderService.loadTranslations(indonesian, english);

        this.dataSource = new MatTableDataSource();

        this.store.dispatch(
            UiActions.createBreadcrumb({
                payload: [
                    {
                        title: 'Home',
                        translate: 'BREADCRUMBS.HOME'
                    },
                    {
                        title: 'Order Managements',
                        translate: 'BREADCRUMBS.ORDER_MANAGEMENTS'
                    },
                    {
                        title: 'Order Details',
                        translate: 'BREADCRUMBS.ORDER_DETAILS',
                        active: true
                    }
                ]
            })
        );

        this.store.dispatch(
            UiActions.createSmallBreadcrumb({
                payload: [
                    {
                        title: 'Quotations'
                    },
                    {
                        title: 'Quotations Send'
                    },
                    {
                        title: 'Sales Order',
                        active: true
                    }
                ]
            })
        );
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.

        // this.dataSource = new MatTableDataSource([
        //     {
        //         id: '1',
        //         product: 'Whiskas Pouch Tuna 85gr',
        //         bonus: false,
        //         orderQty: 24,
        //         delivered: 24,
        //         invoiced: 24,
        //         unitOfMeasured: 24,
        //         unitPrice: 10000,
        //         gross: 240000,
        //         amountDisc1: 0,
        //         amountDisc2: 0,
        //         amountDisc3: 0,
        //         promo: 0,
        //         amountPromo: 0
        //     },
        //     {
        //         id: '2',
        //         product: 'Whiskas Pouch Salmon 150gr',
        //         bonus: false,
        //         orderQty: 24,
        //         delivered: 24,
        //         invoiced: 24,
        //         unitOfMeasured: 24,
        //         unitPrice: 12000,
        //         gross: 288000,
        //         amountDisc1: 0,
        //         amountDisc2: 0,
        //         amountDisc3: 0,
        //         promo: 0,
        //         amountPromo: 0
        //     }
        // ]);

        this._unSubs$ = new Subject<void>();

        const { id } = this.route.snapshot.params;

        this.order$ = this.store.select(OrderSelectors.getSelectedOrder).pipe(
            tap(data => {
                if (data && data.orderBrands && data.orderBrands.length > 0) {
                    this.dataSource = new MatTableDataSource(
                        data.orderBrands[0].orderBrandCatalogues
                    );
                }
            })
        );
        this.store.dispatch(OrderActions.fetchOrderRequest({ payload: id }));

        this.smallBreadcrumbs$ = this.store.select(UiSelectors.getSmallBreadcrumbs);
    }

    ngOnDestroy(): void {
        // Called once, before the instance is destroyed.
        // Add 'implements OnDestroy' to the class.

        this.store.dispatch(UiActions.resetBreadcrumb());
        this.store.dispatch(UiActions.resetSmallBreadcrumb());
        this.store.dispatch(OrderActions.resetOrders());

        this._unSubs$.next();
        this._unSubs$.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    safeValue(item: any): any {
        return item ? item : '-';
    }
}
