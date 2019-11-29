import {
    ChangeDetectionStrategy,
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation
} from '@angular/core';
import { MatDialog, MatTableDataSource } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { LogService } from 'app/shared/helpers';
import { IBreadcrumbs } from 'app/shared/models';
import { UiActions } from 'app/shared/store/actions';
import { UiSelectors } from 'app/shared/store/selectors';
import { Observable, Subject } from 'rxjs';
import { distinctUntilChanged, takeUntil, tap, filter } from 'rxjs/operators';

import { locale as english } from '../i18n/en';
import { locale as indonesian } from '../i18n/id';
import { OrderQtyFormComponent } from '../order-qty-form/order-qty-form.component';
import { OrderActions } from '../store/actions';
import { fromOrder } from '../store/reducers';
import { OrderSelectors } from '../store/selectors';

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
    selectedRowIndex$: Observable<string>;
    smallBreadcrumbs$: Observable<IBreadcrumbs[]>;
    isLoading$: Observable<boolean>;

    private _unSubs$: Subject<void>;

    constructor(
        private matDialog: MatDialog,
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

        this._unSubs$ = new Subject<void>();

        this.initSource();

        this.isLoading$ = this.store.select(OrderSelectors.getIsLoading);

        this.selectedRowIndex$ = this.store.select(UiSelectors.getSelectedRowIndex);

        this.smallBreadcrumbs$ = this.store.select(UiSelectors.getSmallBreadcrumbs);

        // Trigger refresh
        this.store
            .select(OrderSelectors.getIsRefresh)
            .pipe(
                filter(v => !!v),
                takeUntil(this._unSubs$)
            )
            .subscribe(isRefresh => {
                this.initSource();
            });
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

    onChangeQty(item: any, type: 'delivered' | 'invoiced'): void {
        this._$log.generateGroup(
            'CLICK CHANGE QTY',
            {
                item: {
                    type: 'log',
                    value: item
                },
                type: {
                    type: 'log',
                    value: type
                }
            },
            'groupCollapsed'
        );

        if (!item || !item.id) {
            return;
        }

        this.store.dispatch(UiActions.setHighlightRow({ payload: item.id }));

        const dialogRef = this.matDialog.open<
            OrderQtyFormComponent,
            any,
            { action: string; payload: number }
        >(OrderQtyFormComponent, {
            data: {
                title: `Set ${type === 'delivered' ? 'Delivered' : 'Invoiced'} Qty`,
                id: item.id,
                label: `${type === 'delivered' ? 'Delivered' : 'Invoiced'} Qty`,
                qty: type === 'delivered' ? +item.deliveredQty : +item.invoicedQty
            },
            disableClose: true
        });

        dialogRef
            .afterClosed()
            .pipe(takeUntil(this._unSubs$))
            .subscribe(resp => {
                this._$log.generateGroup(
                    'AFTER CLOSED DIALOG EDIT QTY',
                    {
                        response: {
                            type: 'log',
                            value: resp
                        }
                    },
                    'groupCollapsed'
                );

                if (resp.action === 'edit' && typeof resp.payload === 'number') {
                    if (type === 'delivered') {
                        this.store.dispatch(
                            OrderActions.updateDeliveredQtyRequest({
                                payload: { id: item.id, body: resp.payload }
                            })
                        );
                    } else if (type === 'invoiced') {
                        this.store.dispatch(
                            OrderActions.updateInvoicedQtyRequest({
                                payload: { id: item.id, body: resp.payload }
                            })
                        );
                    }
                }

                this.store.dispatch(UiActions.resetHighlightRow());
            });
    }

    safeValue(item: any): any {
        return item ? item : '-';
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    private initSource(): void {
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
    }
}
