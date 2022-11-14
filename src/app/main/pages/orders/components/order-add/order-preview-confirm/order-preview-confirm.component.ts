import {
    Component,
    OnInit,
    OnDestroy,
    ViewEncapsulation,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Output,
    EventEmitter,
    ElementRef,
    ViewChild,
    AfterViewChecked,
    HostListener
} from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { IBreadcrumbs, IFooterActionConfig } from 'app/shared/models/global.model';
import { Store } from '@ngrx/store';
import { FormActions, UiActions } from 'app/shared/store/actions';
import { fromAddProduct, fromConfirmOrderPayment } from '../../../store/reducers';
import { OrderCheckoutSelectors, ConfirmOrderPaymentSelectors } from '../../../store/selectors';
import { Router } from '@angular/router';
import { ModalConfirmationComponent } from '../modal-confirmation/modal-confirmation.component';
import { MatDialog, MatTabChangeEvent } from '@angular/material';
import { FormSelectors } from 'app/shared/store/selectors';
import {
    IModalConfirmation,
    OrderStoreAndInformation,
    ProductCheckout,
    TYPE_MODAL,
    PayloadOption,
    OrderBrandsInf,
    PAYMENT_TYPE,
    IConfirmOrderPayment,
    IConfirmOrderPaymentParcels,
} from '../../../models';
import { OrderHelperService, PaymentListService } from '../../../services';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject, Observable } from 'rxjs';
import { ConfirmOrderPaymentActions } from '../../../store/actions';
import { OrderCheckoutActions } from '../../../store/actions';
import { sum } from 'lodash';
import { IError, ILimitOrder } from '../../../store/reducers/confirm-order-payment.reducer';

const EL_THRESHOLD = 100;

@Component({
    selector: 'app-order-preview-confirm',
    templateUrl: './order-preview-confirm.component.html',
    styleUrls: ['./order-preview-confirm.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderPreviewConfirmComponent implements OnInit, OnDestroy, AfterViewChecked {
    @Output() selectedTabChange: EventEmitter<MatTabChangeEvent>;
    @ViewChild("elem", { static: false }) _element: ElementRef;

    getErrorConfirmOrder$: Observable<any>;
    dataCartCheckout$: Observable<ProductCheckout>;
    isLoading$: Observable<boolean>;
    isLoadingConfirmOrder$: Observable<boolean>;
    labelNoRecord = 'No data available';

    private unSubs$: Subject<string> = new Subject<string>();
    paymentChannels = [];
    dataStore: OrderStoreAndInformation;
    paymentListOptions = [];
    allPaymentList: PayloadOption;
    paymentMethod = [];
    selectPaymentType: number;
    // selectPaymentMethod: number;
    selectpaylaterTypeId: number;
    mapParcels: IConfirmOrderPaymentParcels[] = [];
    paymentTypeSupplierMethodId: number;
    isFormPaymentValid = false;
    tab:string[] = []
    observer: any
    observed: boolean = false;
    selectedTab: number = 0;
    routeBack: boolean = false;

    paramSubmit: IConfirmOrderPayment = {
        storeId: null,
        orderId: null,
        parcels: [],
    };

    displayedColumnsOrderPreviewList = [
        'order-sku-id',
        'order-sku-supplier',
        'order-product-name',
        'order-qty',
        'order-uom',
        'order-price',
        'order-tax',
        'order-promo',
    ];

    displayedColumnsBonusPreviewList = [
        'bonus-order-sku-id',
        'bonus-order-sku-supplier',
        'bonus-order-product-name',
        'bonus-order-qty',
        'bonus-order-uom',
    ];

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
                label: 'Submit',
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
        private confirmOrderStore: Store<fromConfirmOrderPayment.FeatureState>,
        private router: Router,
        private dialog: MatDialog,
        private PaymentListService: PaymentListService,
        private cdRef: ChangeDetectorRef,
        private orderHelperService: OrderHelperService,
    ) {
        // Set breadcrumbs
        this.store.dispatch(
            UiActions.createBreadcrumb({
                payload: this._breadCrumbs,
            })
        );

        // Set footer action
        this.store.dispatch(UiActions.setFooterActionConfig({ payload: this.footerConfig }));
        this.store.dispatch(UiActions.showFooterAction());

        this.store.dispatch(FormActions.setCancelButtonAction({ payload: 'CANCEL' }));
        this.store.dispatch(FormActions.enableSaveButton());
        this.store.dispatch(FormActions.resetClickSaveButton());
        this.store.dispatch(FormActions.resetClickCancelButton());
        this.store.dispatch(FormActions.setFormStatusInvalid());
    }

    @HostListener('window:popstate', ['$event'])
    onPopState() {
        this.routeBack = true            
    }

    canDeactivate() {
        if (this.routeBack) {
            return true;
        } else {
            this.openModalConfirmation('CANCEL')
            return false
        }
    }

    ngOnInit() {
        this.store.dispatch(UiActions.showFooterAction());
        // let paramsCo = history.state;

        let dataStoreVal = this.orderHelperService.getOrderStoreAndShipmentInformation();
        let paramOrderCheckout = this.orderHelperService.getOrderCheckoutPayload();
        //check data ada atau tidak
        if (dataStoreVal) {
            // convert string to valid object if data != null
            this.dataStore = dataStoreVal;
        }

        this.store.dispatch(
            OrderCheckoutActions.fetchCheckoutOrderRequest({
                payload: paramOrderCheckout,
            })
        );

        this.dataCartCheckout$ = this.store.select(OrderCheckoutSelectors.getDataCheckout);
        this.isLoading$ = this.store.select(OrderCheckoutSelectors.selectIsLoading);
        this.getErrorConfirmOrder$ = this.store.select(ConfirmOrderPaymentSelectors.getError);
        this.isLoadingConfirmOrder$ = this.store.select(ConfirmOrderPaymentSelectors.getIsLoading);

        this.dataCartCheckout$.pipe(takeUntil(this.unSubs$)).subscribe((value) => {
            if (value && value.items) {
                this.tab = value.items.map(item => item.invoiceGroup.name)
                value.items.map((itemVal) => {
                    this.PaymentListService.paymentList(itemVal.orderParcelId)
                        .pipe(takeUntil(this.unSubs$))
                        .subscribe((res) => {
                            this.paymentMethod.push({
                                orderParcelId: itemVal.orderParcelId,
                                paymentList: res,
                                selectedPaymentChannel: null,
                                selectedPaymentType: null,
                                orderBrands: itemVal.orderBrands,
                            });

                            //mapping for data parcel
                            this.mapParcels.push({
                                orderParcelId: Number(itemVal.orderParcelId),
                                paymentTypeSupplierMethodId: null,
                                paymentTypeId: null,
                                paymentChannelId: null,
                                paylaterTypeId: null,
                            });
                            // Mark for check
                            this.cdRef.detectChanges();
                        });
                });
                this.paramSubmit = {
                    storeId: Number(value.store.id),
                    orderId: Number(value.orderId),
                    parcels: [],
                };
            }
        });

        this.getErrorConfirmOrder$.pipe(takeUntil(this.unSubs$)).subscribe({
            next: (err: IError) => {
                if (err) {
                    if (err.errorCode === "ERR-RPO-NOT-FOUND") {
                        this.openModalTimeout('SUBMIT');
                    } else if (err.errorData) {
                        const limitOrder = err.errorData as ILimitOrder[];
                        this.store.dispatch(OrderCheckoutActions.fetchCheckoutOrderWithErrorConfirmOrder({
                            payload: limitOrder
                        }));
                    }
                    this.store.dispatch(FormActions.setFormStatusInvalid());
                }
            }
        })

        this.confirmOrderStore
            .select(ConfirmOrderPaymentSelectors.getResult)
            .pipe(takeUntil(this.unSubs$))
            .subscribe(res => {
                if (res) {
                    if (res.code === 200) {
                        this.routeBack = true
                        this.router.navigateByUrl('/pages/orders');
                        this.orderHelperService.resetFormCreateOrder();
                    }
                }
            })

        // Handle cancel button action (footer)
        this.store
            .select(FormSelectors.getIsClickCancelButton)
            .pipe(
                filter((isClick) => !!isClick),
                takeUntil(this.unSubs$)
            )
            .subscribe((isClick) => {
                this.openModalConfirmation('CANCEL');
                this.store.dispatch(FormActions.resetClickCancelButton());
            });

        // Handle save button action (footer)
        this.store
            .select(FormSelectors.getIsClickSaveButton)
            .pipe(
                filter((isClick) => !!isClick),
                takeUntil(this.unSubs$)
            )
            .subscribe((isClick) => {
                this.openModalConfirmation('SUBMIT');

                this.store.dispatch(FormActions.resetClickSaveButton());
            });

        const option = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };
        const _this = this;
        this.observer = new IntersectionObserver(
            (entries) => {
                _this.checkData();
            },
            option
        );

        this.cdRef.detectChanges();
    }

    checkData(){
        let tabTops = document.querySelectorAll('.mat-tab-labels');
        let targets = document.querySelectorAll('.order-list-preview');
        const top = Number(tabTops.length ? tabTops[0].getBoundingClientRect().top : 0);
        if(top){
            targets.forEach(el => {
                const elTop = Number(el.getBoundingClientRect().top);
                if(Math.abs(elTop - top) < EL_THRESHOLD){
                    this.selectedTab = parseInt(el.getAttribute('data-id'));
                }
            })
        }
        this.cdRef.detectChanges();
    }


    ngAfterViewChecked() {
        if (!this._element) return;
        let els = document.querySelectorAll('.order-list-preview');
        if (!this.observed && els.length !== 0) {
            els.forEach(el => {
                this.observer.observe(el);
            })
            
            this.observed = true;
        }
    }

    goToBrand(invoiceGroupName: string) {
        document.getElementById(invoiceGroupName).scrollIntoView();
    }

    onSelectedTab(changeEvent: MatTabChangeEvent): void {
        const index = this.tab.findIndex(item => item === changeEvent.tab.textLabel)
        this.selectedTab = index;
        this.goToBrand(changeEvent.tab.textLabel);
    }

    getSelectedPaymentList(orderParcelId: string, select: 'type' | 'method') {
        const data = this.paymentMethod.find(item => item.orderParcelId === orderParcelId)
        if (data && data.selectedPaymentType) {
            const selectedPaymentType = data.paymentList.find(item => item.paymentTypeId === data.selectedPaymentType)
            if (select === 'type') {
                return selectedPaymentType
            }

            if (data.selectedPaymentChannel && select === 'method') {
                const selectedPaymentChannel = selectedPaymentType.paymentChannels.find(item => item.id === data.selectedPaymentChannel)
                return selectedPaymentChannel
            }
        }
    }

    getPaymentList(orderParcelId: string, select: 'type' | 'method'): any[] {
        const data = this.paymentMethod.find((item) => item.orderParcelId === orderParcelId);
        // ubah *ngFor="let row of paymentListMock"
        // ke *ngFor="let row of getPaymentList(item.orderParcelId, 'type')"
        if (data) {
            if (select === 'type') {
                return data.paymentList;
            }
            if (data.selectedPaymentType && select === 'method') {
                const selectedPaymentType = data.paymentList.find(
                    (item) => item.paymentTypeId === data.selectedPaymentType
                );
                if (selectedPaymentType) {
                    if (selectedPaymentType.paylaterTypes) {
                        this.selectpaylaterTypeId = selectedPaymentType.paylaterTypes[0].id;
                    } else {
                        //for select bayar di tempat
                        this.selectpaylaterTypeId = 1;
                    }
                    return selectedPaymentType.paymentChannels;
                }
            }
        }

        return [];
    }

    onChangePaymentType(event: any, orderParcelIdVal: string) {
        let index = this.paymentMethod.findIndex(item => item.orderParcelId === orderParcelIdVal)
        this.paymentMethod[index] = {
            ...this.paymentMethod[index],
            selectedPaymentType: event.value.paymentTypeId
        }
        this.selectPaymentType = event.value.paymentTypeId;
        this.paymentTypeSupplierMethodId = event.value.paymentTypeSupplierMethodId;

        const totalFormPayment = this.mapParcels.length;
        let countFilledPayment = 0;

        this.mapParcels = this.mapParcels.map((parcel) => {
            let dataParcel: IConfirmOrderPaymentParcels;
            if (Number(parcel.orderParcelId) === Number(orderParcelIdVal)) {
                dataParcel = {
                    ...parcel,
                    paymentTypeSupplierMethodId: this.paymentTypeSupplierMethodId,
                    paymentTypeId: this.selectPaymentType,
                    paymentChannelId: null
                };
            } else {
                dataParcel = parcel;
            }
            
            if (dataParcel.paymentChannelId) {
                countFilledPayment++;
            }

            return dataParcel;
        });

        this.validationFormPayment(totalFormPayment, countFilledPayment);
        this.orderHelperService.removeOrderConfirmPaymentPayload();
    }

    onChangePaymentMethod(event, orderParcelIdVal) {
        const selectPaymentMethod = event.value;

        let index = this.paymentMethod.findIndex(item => item.orderParcelId === orderParcelIdVal)
        this.paymentMethod[index] = {
            ...this.paymentMethod[index],
            selectedPaymentChannel: selectPaymentMethod.id
        }

        const totalFormPayment = this.mapParcels.length;
        let countFilledPayment = 0;

        this.mapParcels = this.mapParcels.map(parcel => {
            let dataParcel: IConfirmOrderPaymentParcels;
            if (Number(parcel.orderParcelId) === Number(orderParcelIdVal)) {
                dataParcel = {
                    ...parcel,
                    paymentChannelId: selectPaymentMethod,
                    paylaterTypeId: parcel.paymentTypeId === PAYMENT_TYPE.PAY_LATER ? this.selectpaylaterTypeId : null
                }
            } else {
                dataParcel = parcel
            }

            if (dataParcel.paymentTypeId && dataParcel.paymentChannelId) {
                countFilledPayment++;
            }

            return dataParcel;
        });

        this.paramSubmit.parcels = this.mapParcels;
        this.orderHelperService.setOrderConfirmPaymentPayload(this.paramSubmit);

        this.validationFormPayment(totalFormPayment, countFilledPayment);
    }

    validationFormPayment(totalFormPayment: number, countFilledPayment: number): void {
        if (totalFormPayment === countFilledPayment) {
            this.store.dispatch(FormActions.setFormStatusValid());
        } else {
            this.store.dispatch(FormActions.setFormStatusInvalid());
        }
    }

    btnBack() {
        this.routeBack = true
        this.orderHelperService.setOrderDataListReset(false);
        this.orderHelperService.removeOrderCheckoutPayload();
        this.orderHelperService.removeOrderConfirmPaymentPayload();
        this.router.navigateByUrl('/pages/orders/add');
    }

    numberFormat(num) {
        if (num) {
            return (
                'Rp' +
                num
                    .toFixed(0)
                    .replace('.', ',')
                    .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.')
            );
        }

        return '-';
    }

    calculateMoney(orderBrands: OrderBrandsInf[], objectKey: string) {
        const total = sum(orderBrands.map((item) => item[objectKey]));
        return this.numberFormat(total);
    }

    ngOnDestroy(): void {
        // Called once, before the instance is destroyed.
        // Add 'implements OnDestroy' to the class.

        this.routeBack = false;

        this.store.dispatch(FormActions.resetClickCancelButton());

        this.store.dispatch(FormActions.resetCancelButtonAction());

        // Reset form status state
        this.store.dispatch(FormActions.resetFormStatus());

        // Reset click save button state
        this.store.dispatch(FormActions.resetClickSaveButton());

        // Hide footer action
        this.store.dispatch(UiActions.hideFooterAction());

        this.unSubs$.next();
        this.unSubs$.complete();

        this.store.dispatch(OrderCheckoutActions.clearState());
        this.confirmOrderStore.dispatch(ConfirmOrderPaymentActions.resetState());

        this.observer.disconnect()
    }

    openModalTimeout(type: TYPE_MODAL) {
        let dataModal: IModalConfirmation;
        switch (type) {
            case 'SUBMIT':
                dataModal = {
                    type,
                    title: 'Sesi checkout Anda sudah habis',
                    message:
                        'Silakan ulangi proses checkout Anda.',
                    txtButtonRight: 'Kembali',
                };
                break;
            default:
                break;
        }

        const dialogRef = this.dialog.open(ModalConfirmationComponent, {
            width: '660px',
            data: dataModal,
            disableClose: true,
        });

        dialogRef.afterClosed().pipe(takeUntil(this.unSubs$)).subscribe((result) => {
            switch (type) {
                case 'SUBMIT':
                    if (result && result.btn === 'right') {
                        this.confirmOrderStore.dispatch(ConfirmOrderPaymentActions.resetState());
                        this.btnBack();
                    }
                    break;
                default:
                    break;
            }
        });
    }

    openModalConfirmation(type: TYPE_MODAL) {
        let dataModal: IModalConfirmation;
        switch (type) {
            case 'CANCEL':
                dataModal = {
                    type,
                    title: 'Cancel the order?',
                    message:
                        'If you wish to cancel manual order, all data you already input will be erased and cannot undone',
                    txtButtonLeft: 'Yes',
                    txtButtonRight: 'No',
                };
                break;
            case 'SUBMIT':
                dataModal = {
                    type,
                    title: 'Submit the order?',
                    message:
                        'Make sure the product and quantity is correct before submitting order.',
                    txtButtonLeft: 'Cancel',
                    txtButtonRight: 'Submit Order',
                };
                break;
            default:
                break;
        }

        const dialogRef = this.dialog.open(ModalConfirmationComponent, {
            width: '660px',
            data: dataModal,
            disableClose: true,
        });

        dialogRef.afterClosed().pipe(takeUntil(this.unSubs$)).subscribe((result) => {
            switch (type) {
                case 'CANCEL':
                    if (result && result.btn === 'left') {
                        this.routeBack = true;
                        this.router.navigateByUrl('/pages/orders');
                        this.orderHelperService.resetFormCreateOrder();
                    }
                    break;
                case 'SUBMIT':
                    if (result && result.btn === 'right') {
                        this.submitOrder();
                    }
                    break;
                default:
                    break;
            }
        });
    }

    submitOrder() {
        const data = this.orderHelperService.getOrderConfirmPaymentPayload();
        this.confirmOrderStore.dispatch(
            ConfirmOrderPaymentActions.postConfirmRequest({
                payload: data,
            })
        );
    }
}
