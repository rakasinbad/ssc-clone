import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    OnDestroy,
    OnInit,
    Output,
    ViewEncapsulation,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import {
    FormStatus,
    IBreadcrumbs,
    IFooterActionConfig,
    LifecyclePlatform,
} from 'app/shared/models/global.model';
import { fuseAnimations } from '@fuse/animations';
import { Store } from '@ngrx/store';
import { FormActions, UiActions } from 'app/shared/store/actions';
import { FormSelectors } from 'app/shared/store/selectors';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import * as _ from 'lodash';
import { Subject } from 'rxjs';
import { distinctUntilChanged, filter, takeUntil, withLatestFrom } from 'rxjs/operators';
import { fromAddProduct } from '../../store/reducers';
import { HelperService } from 'app/shared/helpers';
import { OrderHelperService } from '../../services';
import { Router } from '@angular/router';
import { IFormStatusChange } from './order-list/order-list.component';
import { CreateManualOrder } from '../../models';

@Component({
    selector: 'app-order-add',
    templateUrl: './order-add.component.html',
    styleUrls: ['./order-add.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderAddComponent implements OnInit, AfterViewInit, OnDestroy {
    private _unSubs$: Subject<void> = new Subject<void>();
    form: FormGroup;
    @Output() onChangeFormOrderStoreAndShipment: EventEmitter<FormStatus> = new EventEmitter<FormStatus>();

    statusChangeOrderStoreAndShipment: FormStatus;
    eventFormStatusOrderDataList: IFormStatusChange;

    private _breadCrumbs: IBreadcrumbs[] = [
        {
            title: 'Home',
        },
        {
            title: 'Order Management',
        },
        {
            title: 'Manual Order',
            active: true,
        },
    ];

    private footerConfig: IFooterActionConfig = {
        progress: {
            title: {
                label: 'Order Add',
                active: false,
            },
            value: {
                active: false,
            },
            active: false,
        },
        action: {
            save: {
                label: 'Next',
                active: true,
            },
            draft: {
                label: 'Save Draft',
                active: false,
            },
            cancel: {
                label: 'Cancel',
                active: true,
            },
        },
    };

    constructor(
        private store: Store<fromAddProduct.FeatureStateAddProduct>,
        private router: Router,
        private orderHelperService: OrderHelperService
    ) {
        // Set breadcrumbs
        this.store.dispatch(
            UiActions.createBreadcrumb({
                payload: this._breadCrumbs,
            })
        );

        // // Set footer action
        // this.store.dispatch(UiActions.setFooterActionConfig({ payload: this.footerConfig }));
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.

        this._initPage();
    }

    ngAfterViewInit(): void {
        // Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
        // Add 'implements AfterViewInit' to the class.

        this._initPage(LifecyclePlatform.AfterViewInit);
    }

    ngOnDestroy(): void {
        // Called once, before the instance is destroyed.
        // Add 'implements OnDestroy' to the class.

        this._initPage(LifecyclePlatform.OnDestroy);
    }

    private _initPage(lifeCycle?: LifecyclePlatform): void {
        switch (lifeCycle) {
            case LifecyclePlatform.AfterViewInit:
                // Display footer action
                this.store.dispatch(UiActions.showFooterAction());

                // Handle cancel button action (footer)
                this.store
                    .select(FormSelectors.getIsClickCancelButton)
                    .pipe(
                        filter((isClick) => !!isClick),
                        takeUntil(this._unSubs$)
                    )
                    .subscribe((isClick) => {
                        this.router.navigateByUrl('/pages/orders');

                        this.store.dispatch(FormActions.resetClickCancelButton());
                        this.store.dispatch(FormActions.resetCancelButtonAction());
                    });

                // Handle save button action (footer)
                this.store
                    .select(FormSelectors.getIsClickSaveButton)
                    .pipe(
                        distinctUntilChanged(),
                        takeUntil(this._unSubs$),
                        withLatestFrom(this.store.select(AuthSelectors.getUserSupplier))
                    )
                    .subscribe(([isClick, userSupplier]) => {
                        if (isClick) {
                            // submit to post cart preview
                            this.onClickedButtonNext();
                        }
                    });
                break;

            case LifecyclePlatform.OnDestroy:
                this.store.dispatch(FormActions.resetClickCancelButton());

                this.store.dispatch(FormActions.resetCancelButtonAction());

                // Reset form status state
                this.store.dispatch(FormActions.resetFormStatus());

                // Reset click save button state
                this.store.dispatch(FormActions.resetClickSaveButton());

                // Hide footer action
                this.store.dispatch(UiActions.hideFooterAction());

                this._unSubs$.next();
                this._unSubs$.complete();

                HelperService.debug('[OrderAddComponent] OnDestroy');
                break;

            default:
                this.store.dispatch(
                    UiActions.setFooterActionConfig({ payload: this.footerConfig })
                );
                this.store.dispatch(UiActions.showFooterAction());

                this.store.dispatch(FormActions.setCancelButtonAction({ payload: 'CANCEL' }));
                this.store.dispatch(FormActions.enableSaveButton());
        }
    }

    onClickedButtonNext(): void {
        const dataStore = this.orderHelperService.getOrderStoreAndShipmentInformation();
        const dataOrder = this.orderHelperService.getOrderDataList();

        if (dataOrder) {
            const mapProduct = [];
            for (let dataMaps of dataOrder) {
                mapProduct.push({
                    catalogueId: dataMaps.catalogueId,
                    qty: dataMaps.orderQty,
                });
            }
    
            const dataParams: CreateManualOrder = {
                storeId: dataStore.storeId,
                supplierStoreId: Number(dataStore.supplierStoreId),
                orderDate: dataStore.date,
                product: mapProduct,
            };
            this.orderHelperService.setOrderCheckoutPayload(dataParams)
            
            this.router.navigate(['/pages/orders/add/preview']);
    
            this.store.dispatch(FormActions.resetClickSaveButton());
        }
    }

    formStatusChangeOrderStoreAndShipment(value: FormStatus): void {
        HelperService.debug('[OrderAddComponent] formStatusChangeOrderStoreAndShipment', value);
        this.statusChangeOrderStoreAndShipment = value;
        this.onChangeFormOrderStoreAndShipment.emit(value);
        this.isButtonNextDisabled();
    }

    formStatusOrderDataList(event: IFormStatusChange): void {
        HelperService.debug('[OrderAddComponent] formStatusOrderDataList', event);
        this.eventFormStatusOrderDataList = {
            formStatus: event.formStatus,
            totalProducts: event.totalProducts
        };
        this.isButtonNextDisabled();
    }

    isButtonNextDisabled() {
        if (
            this.statusChangeOrderStoreAndShipment === 'VALID' &&
            this.eventFormStatusOrderDataList.formStatus === 'VALID' &&
            this.eventFormStatusOrderDataList.totalProducts > 0
        ) {
            this.store.dispatch(FormActions.enableSaveButton());
            this.store.dispatch(FormActions.setFormStatusValid());
        } else {
            this.store.dispatch(FormActions.disableSaveButton());
            this.store.dispatch(FormActions.setFormStatusInvalid());
        }
    }
}
