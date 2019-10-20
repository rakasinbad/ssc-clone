import {
    ChangeDetectionStrategy,
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation
} from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { IBreadcrumbs } from 'app/shared/models';
import { UiActions } from 'app/shared/store/actions';
import { UiSelectors } from 'app/shared/store/selectors';
import { Observable, Subject } from 'rxjs';

import { IOrderDemo } from '../models';
import { OrderActions } from '../store/actions';
import { fromOrder } from '../store/reducers';
import { OrderSelectors } from '../store/selectors';
import { MatTableDataSource } from '@angular/material';

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
        'bonus',
        'orderQty',
        'delivered',
        'invoiced',
        'unitOfMeasured',
        'unitPrice',
        'gross',
        'amountDisc1',
        'amountDisc2',
        'amountDisc3',
        'promo',
        'amountPromo'
    ];

    order$: Observable<IOrderDemo>;
    smallBreadcrumbs$: Observable<IBreadcrumbs[]>;

    private _unSubs$: Subject<void>;

    constructor(private store: Store<fromOrder.FeatureState>, public translate: TranslateService) {
        this.dataSource = new MatTableDataSource();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.

        this.dataSource = new MatTableDataSource([
            {
                id: '1',
                product: 'Whiskas Pouch Tuna 85gr',
                bonus: false,
                orderQty: 24,
                delivered: 24,
                invoiced: 24,
                unitOfMeasured: 24,
                unitPrice: 10000,
                gross: 240000,
                amountDisc1: 0,
                amountDisc2: 0,
                amountDisc3: 0,
                promo: 0,
                amountPromo: 0
            },
            {
                id: '2',
                product: 'Whiskas Pouch Salmon 150gr',
                bonus: false,
                orderQty: 24,
                delivered: 24,
                invoiced: 24,
                unitOfMeasured: 24,
                unitPrice: 12000,
                gross: 288000,
                amountDisc1: 0,
                amountDisc2: 0,
                amountDisc3: 0,
                promo: 0,
                amountPromo: 0
            }
        ]);
        this._unSubs$ = new Subject<void>();
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
        this.order$ = this.store.select(OrderSelectors.getSelectedOrder);
        this.smallBreadcrumbs$ = this.store.select(UiSelectors.getSmallBreadcrumbs);
    }

    ngOnDestroy(): void {
        // Called once, before the instance is destroyed.
        // Add 'implements OnDestroy' to the class.

        this.store.dispatch(UiActions.createBreadcrumb({ payload: null }));
        this.store.dispatch(UiActions.createSmallBreadcrumb({ payload: null }));
        this.store.dispatch(OrderActions.getOrderDemoDetail({ payload: null }));

        this._unSubs$.next();
        this._unSubs$.complete();
    }
}
