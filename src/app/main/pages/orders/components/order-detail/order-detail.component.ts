import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output,
    ViewEncapsulation,
} from '@angular/core';
import { MatDialog } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { Store } from '@ngrx/store';
import { HelperService, LogService } from 'app/shared/helpers';
import { UiActions } from 'app/shared/store/actions';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { OrderQtyFormComponent } from '../../order-qty-form/order-qty-form.component';
import { OrderActions } from '../../store/actions';
import { fromOrder } from '../../store/reducers';
import { OrderSelectors } from '../../store/selectors';

@Component({
    selector: 'app-order-detail',
    templateUrl: './order-detail.component.html',
    styleUrls: ['./order-detail.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderDetailComponent implements OnInit, OnDestroy {
    @Input()
    data: any;

    @Input()
    loading: boolean;

    private _unSubs$: Subject<any> = new Subject();
    
    @Output('onSubmit')
    formValue: EventEmitter<any>;

    @Output('onChangeOrderStatus')
    orderStatus: EventEmitter<string> = new EventEmitter();

    type: string = 'original';
    onEditValue: any;

    cataloguesChanges: any;
    bonusCatalogues: any;

    orderLineSubmitable: boolean = true;
    bonusSubmitable: boolean = true;

    constructor(
        private matDialog: MatDialog,
        private route: ActivatedRoute,
        private store: Store<fromOrder.FeatureState>,
        private _$log: LogService
    ) {
        this.formValue = new EventEmitter();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.
        /* this._unSubs$ = new Subject<void>();

        this.initSource();

        this.isLoading$ = this.store.select(OrderSelectors.getIsLoading);

        this.selectedRowIndex$ = this.store.select(UiSelectors.getSelectedRowIndex);

        this.smallBreadcrumbs$ = this.store.select(UiSelectors.getSmallBreadcrumbs);

        // Trigger refresh
        this.store
            .select(OrderSelectors.getIsRefresh)
            .pipe(
                filter((v) => !!v),
                takeUntil(this._unSubs$)
            )
            .subscribe((isRefresh) => {
                this.initSource();
            }); */
    }

    ngOnDestroy(): void {
        this.store.dispatch(UiActions.resetBreadcrumb());
        this.store.dispatch(UiActions.resetSmallBreadcrumb());
        this.store.dispatch(OrderActions.resetOrders());

        this._unSubs$.next();
        this._unSubs$.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    calculateGrossPrice(grossPrice: number, cataloguePromo: number, qty: number): number {
        if (
            typeof grossPrice !== 'number' ||
            typeof cataloguePromo !== 'number' ||
            typeof qty !== 'number'
        ) {
            return 0;
        }

        if (grossPrice >= cataloguePromo && qty) {
            return (grossPrice - cataloguePromo) * qty;
        }

        return 0;
    }

    calculateUnit(nettPrice: number, qty: number): number {
        if (typeof nettPrice !== 'number' || typeof qty !== 'number') {
            return 0;
        }

        if (qty && nettPrice) {
            return nettPrice / qty;
        } else if (nettPrice > qty && qty && nettPrice) {
            return nettPrice / qty;
        }

        return 0;
    }

    onChangeQty(item: any, type: 'delivered' | 'invoiced'): void {
        this._$log.generateGroup(
            'CLICK CHANGE QTY',
            {
                item: {
                    type: 'log',
                    value: item,
                },
                type: {
                    type: 'log',
                    value: type,
                },
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
                qty: type === 'delivered' ? +item.deliveredQty : +item.invoicedQty,
            },
            disableClose: true,
        });

        dialogRef
            .afterClosed()
            .pipe(takeUntil(this._unSubs$))
            .subscribe((resp) => {
                this._$log.generateGroup(
                    'AFTER CLOSED DIALOG EDIT QTY',
                    {
                        response: {
                            type: 'log',
                            value: resp,
                        },
                    },
                    'groupCollapsed'
                );

                if (resp.action === 'edit' && typeof resp.payload === 'number') {
                    if (type === 'delivered') {
                        this.store.dispatch(
                            OrderActions.updateDeliveredQtyRequest({
                                payload: { id: item.id, body: resp.payload },
                            })
                        );
                    } else if (type === 'invoiced') {
                        this.store.dispatch(
                            OrderActions.updateInvoicedQtyRequest({
                                payload: { id: item.id, body: resp.payload },
                            })
                        );
                    }
                }

                this.store.dispatch(UiActions.resetHighlightRow());
            });
    }

    getEditCondition() : void {
        this.onEditValue = this.store.select(OrderSelectors.getEditCondition);
    }

    safeValue(item: any): any {
        return item ? item : '-';
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    private initSource(): void {
        /* const { id } = this.route.snapshot.params;

        this.order$ = this.store.select(OrderSelectors.getSelectedOrder).pipe(
            tap((data) => {
                if (data && data.orderBrands && data.orderBrands.length > 0) {
                    const orderBrandCatalogues =
                        _.flatten(_.map(data.orderBrands, 'orderBrandCatalogues')) || [];

                    this.dataSource = new MatTableDataSource(orderBrandCatalogues);
                }
            })
        );

        this.store.dispatch(OrderActions.fetchOrderRequest({ payload: id })); */
    }

    onSelectedTab(value) : void {
        switch (value) {
            case 2:
                this.type = "delivered";
                break;
            case 1:
                this.type = "dispatched";
                break;
            case 0:
            default:
                this.type = "original";
                break;
        }

        this.store.dispatch(OrderActions.onEditFinished());
    }

    onSubmit(): void {
        this.formValue.emit({
            status: "pending_partial",
            catalogues : this.cataloguesChanges || [],
            bonusCatalogues : this.bonusCatalogues || []
        });
    }

    onCancel() : void {
        this.store.dispatch(OrderActions.onEditFinished());
        this.getEditCondition();
    }

    onPropose() : void {
        console.log({
            orderLine : this.orderLineSubmitable,
            bonus : this.bonusSubmitable
        });
        
        this.store.dispatch(OrderActions.onEdit());
        this.getEditCondition();
    }

    onChangeCatalogues(value) : void {
        this.cataloguesChanges = value.catalogues;
    }

    onChangeBonus(value) : void {
        this.bonusCatalogues = value.catalogues;
    }

    onValidateOrderLine(submitable) : void {
        this.orderLineSubmitable = submitable;
    }

    onValidateBonus(submitable) : void {
        this.bonusSubmitable = submitable;
    }

}
