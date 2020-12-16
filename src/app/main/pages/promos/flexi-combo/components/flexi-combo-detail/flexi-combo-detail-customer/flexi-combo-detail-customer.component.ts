import {
    ChangeDetectionStrategy,
    Component,
    OnInit,
    OnDestroy,
    ChangeDetectorRef,
    ViewEncapsulation,
    NgZone,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { HelperService } from 'app/shared/helpers';
import { SegmentationBasePromo } from 'app/shared/models/segmentation-base.model';
import { SpecifiedTarget } from 'app/shared/models/specified-target.model';
import { Observable, Subscription, Subject, BehaviorSubject, of, fromEvent } from 'rxjs';
import {
    FlexiCombo,
    IPromoChannel,
    IPromoCluster,
    IPromoGroup,
    IPromoStore,
    IPromoType,
    IPromoWarehouse,
} from '../../../models';
import * as fromFlexiCombos from '../../../store/reducers';
import { FlexiComboSelectors } from '../../../store/selectors';
import { FlexiComboApiService } from '../../../services';
import { WarehouseDetail as Entity } from '../../../models/flexi-combo.model';
import { IPaginatedResponse } from 'app/shared/models/global.model';
import * as _ from 'lodash';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { UserSupplier } from 'app/shared/models/supplier.model';
import {
    tap,
    withLatestFrom,
    takeUntil,
    take,
    catchError,
    switchMap,
    map,
    exhaustMap,
} from 'rxjs/operators';

@Component({
    selector: 'app-flexi-combo-detail-customer',
    templateUrl: './flexi-combo-detail-customer.component.html',
    styleUrls: ['./flexi-combo-detail-customer.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlexiComboDetailCustomerComponent implements OnInit, OnDestroy {
    flexiCombo$: Observable<FlexiCombo>;
    isLoading$: Observable<boolean>;

    segmentBase = this._$helperService.segmentationBasePromo();
    eSegmentBase = SegmentationBasePromo;
    specifiedTargets = this._$helperService.specifiedTarget();
    eSpecifiedTargets = SpecifiedTarget;

    //  // Subject untuk keperluan subscription.
    subs2$: Subject<void> = new Subject<void>();
    // // Menyimpan state loading-nya Entity.
    // isEntityLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    rawAvailableEntities$: BehaviorSubject<Array<Entity>> = new BehaviorSubject<Array<Entity>>([]);
    availableEntities$: BehaviorSubject<Array<Entity>> = new BehaviorSubject<Array<Entity>>([]);

    notifier = new Subject();
    public subs: Subscription;
    public subsDetail: Subscription;
    public benefitSetting = [];
    public statNewStore = false;
    public statActiveStore = false;
    public specifiedTargetValue = 'none';
    public custWarehouse = [];
    public custType = [];
    public custGroup = [];
    public custCluster = [];
    public custChannel = [];
    public warehouseDetailnya = [];

    constructor(
        private store: Store<fromFlexiCombos.FeatureState>,
        private _$helperService: HelperService,
        private flexiComboApiService: FlexiComboApiService,
        private cdRef: ChangeDetectorRef,
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    private requestSegment(params, segment): void {
        of(null)
            .pipe(
                withLatestFrom<any, UserSupplier>(
                    this.store.select<UserSupplier>(AuthSelectors.getUserSupplier)
                ),
                tap((x) => HelperService.debug('GET USER SUPPLIER FROM STATE', x)),
                switchMap<[null, UserSupplier], Observable<IPaginatedResponse<Entity>>>(
                    ([_, userSupplier]) => {
                        // Jika user tidak ada data supplier.
                        if (!userSupplier) {
                            throw new Error('ERR_USER_SUPPLIER_NOT_FOUND');
                        }

                        // Membentuk query baru.
                        const newQuery = { ...params };
                        
                        params['segment'] = segment;
                        // Melakukan request data warehouse.
                        return this.flexiComboApiService
                        .findSegmentPromo<IPaginatedResponse<Entity>>(params, segment)
                            .pipe(
                                tap((response) =>
                                    HelperService.debug('FIND ENTITY Cross Selling', {
                                        params: newQuery,
                                        response,
                                    })
                                )
                            );
                    }
                ),
                take(1),
                catchError((err) => {
                    throw err;
                })
            )
            .subscribe({
                next: (response) => {
                    let addedRawAvailableEntities: Array<Entity> = [];

                    // Menetampan nilai available entities yang akan ditambahkan.
                    if (Array.isArray(response)) {
                        addedRawAvailableEntities = response;
                        if (segment == 'warehouse') {
                            this.custWarehouse = addedRawAvailableEntities;
                        } else if (segment == 'type'){
                            this.custType = addedRawAvailableEntities;
                        } else if (segment == 'group') {
                            this.custGroup = addedRawAvailableEntities;
                        } else if (segment == 'channel'){
                            this.custChannel = addedRawAvailableEntities;
                        } else if (segment == 'cluster'){
                            this.custCluster = addedRawAvailableEntities;
                        }

                    } else {
                        addedRawAvailableEntities = response.data;
                        if (segment == 'warehouse') {
                            this.custWarehouse = addedRawAvailableEntities;
                        } else if (segment == 'type'){
                            this.custType = addedRawAvailableEntities;
                        } else if (segment == 'group') {
                            this.custGroup = addedRawAvailableEntities;
                        } else if (segment == 'channel'){
                            this.custChannel = addedRawAvailableEntities;
                        } else if (segment == 'cluster'){
                            this.custCluster = addedRawAvailableEntities;
                        }
                    }

                    this.cdRef.markForCheck();
                },
                error: (err) => {
                    HelperService.debug('ERROR Detail Segment', { params, error: err });
                    // this.helper$.showErrorNotification(new ErrorHandler(err));
                },
                complete: () => {
                    HelperService.debug('Detail Segment COMPLETED');
                },
            });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.
        this.availableEntities$.next([]);
        this.rawAvailableEntities$.next([]);

        this.flexiCombo$ = this.store.select(FlexiComboSelectors.getSelectedItem).pipe(
            map((item) => {
                return item;
            })
        );
        this.subs = this.flexiCombo$.subscribe((val) => {
            this.benefitSetting.push(val);
            this.statNewStore = this.benefitSetting[0].isNewStore;
            this.statActiveStore = this.benefitSetting[0].isActiveStore;
            if (this.statNewStore == false && this.statActiveStore == false) {
                this.specifiedTargetValue = 'none';
            } else if (this.statNewStore == true && this.statActiveStore == false) {
                this.specifiedTargetValue = 'isNewStore';
            } else if (this.statNewStore == false && this.statActiveStore == true) {
                this.specifiedTargetValue = 'isActiveStore';
            }
        });

        let params = {};

        if (
            this.benefitSetting[0].target == 'all' ||
            this.benefitSetting[0].target == 'segmentation'
        ) {
            if (this.benefitSetting[0].base == 'sku') {
                let sku = this.benefitSetting[0].promoCatalogues;
                let idSku = [];
                idSku = sku.map((item) => item.catalogueId);
                params['catalogueId'] = idSku.toString();
                params['supplierId'] = this.benefitSetting[0].supplierId;
                this.requestSegment(params, 'warehouse');
                this.requestSegment(params, 'type');
                this.requestSegment(params, 'group');
                this.requestSegment(params, 'channel');
                this.requestSegment(params, 'cluster');
            } else if (this.benefitSetting[0].base == 'brand') {
                let brand = this.benefitSetting[0].promoBrands;
                let idBrand = [];
                idBrand = brand.map((item) => item.invoiceGroupId);
                params['brandId'] = idBrand.toString();
                params['supplierId'] = this.benefitSetting[0].supplierId;
                this.requestSegment(params, 'warehouse');
                this.requestSegment(params, 'type');
                this.requestSegment(params, 'group');
                this.requestSegment(params, 'channel');
                this.requestSegment(params, 'cluster');
            } else if (this.benefitSetting[0].base == 'invoice_group') {
                let ev = this.benefitSetting[0].promoInvoiceGroups;
                let idFaktur = [];
                idFaktur = ev.map((item) => item.invoiceGroupId);
                params['fakturId'] = idFaktur.toString();
                params['supplierId'] = this.benefitSetting[0].supplierId;
                this.requestSegment(params, 'warehouse');
                this.requestSegment(params, 'type');
                this.requestSegment(params, 'group');
                this.requestSegment(params, 'channel');
                this.requestSegment(params, 'cluster');
            }
        }

        this.cdRef.detectChanges();

        this.isLoading$ = this.store.select(FlexiComboSelectors.getIsLoading);
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    getStores(value: IPromoStore[]): string {
        if (value && value.length > 0) {
            const store = value.map((v) => v.store.name);

            return store.length > 0 ? store.join(', ') : '-';
        }

        return '-';
    }

    getStoreChannels(value: Entity[]): string {
        if (value && value.length > 0) {
            const storeChannel = value.map((v) => v.channelName);

            return storeChannel.length > 0 ? storeChannel.join(', ') : '-';
        }

        return '-';
    }

    getStoreClusters(value: Entity[]): string {
        if (value && value.length > 0) {
            const storeCluster = value.map((v) => v.clusterName);

            return storeCluster.length > 0 ? storeCluster.join(', ') : '-';
        }

        return '-';
    }

    getStoreGroups(value: Entity[]): string {
        if (value && value.length > 0) {
            const storeGroup = value.map((v) => v.groupName);

            return storeGroup.length > 0 ? storeGroup.join(', ') : '-';
        }

        return '-';
    }

    getStoreTypes(value: Entity[]): string {
        if (value && value.length > 0) {
            const storeType = value.map((v) => v.typeName);

            return storeType.length > 0 ? storeType.join(', ') : '-';
        }

        return '-';
    }

    getWarehouses(value: Entity[]): string {
        if (value && value.length > 0) {
            const warehouse = value.map((v) => v.warehouseName);

            return warehouse.length > 0 ? warehouse.join(', ') : '-';
        }

        return '-';
    }

    ngOnDestroy(): void {
        this.subs.unsubscribe();
    }
}
