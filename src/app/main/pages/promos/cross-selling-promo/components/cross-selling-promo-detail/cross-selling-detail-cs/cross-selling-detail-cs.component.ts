import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { Store } from '@ngrx/store';
import { HelperService } from 'app/shared/helpers';
import { SegmentationBasePromo } from 'app/shared/models/segmentation-base.model';
import { Observable, Subscription, of } from 'rxjs';
import {
    CrossSelling,
    IPromoChannel,
    IPromoCluster,
    IPromoGroup,
    IPromoStore,
    IPromoType,
    IPromoWarehouse,
} from '../../../models';
import * as fromCrossSellingPromos from '../../../store/reducers';
import { CrossSellingPromoSelectors } from '../../../store/selectors';
import { CrossSellingPromoApiService } from '../../../services/cross-selling-promo-api.service';
import { WarehouseDetail as Entity } from '../../../models/cross-selling-detail.model';
import { IPaginatedResponse } from 'app/shared/models/global.model';
import * as _ from 'lodash';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { UserSupplier } from 'app/shared/models/supplier.model';
import {
    tap,
    withLatestFrom,
    take,
    catchError,
    switchMap,
    map,
} from 'rxjs/operators';

@Component({
  selector: 'app-cross-selling-detail-cs',
  templateUrl: './cross-selling-detail-cs.component.html',
  styleUrls: ['./cross-selling-detail-cs.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CrossSellingDetailCsComponent implements OnInit {
    crossSellingPromo$: Observable<CrossSelling>;
    isLoading$: Observable<boolean>;

    segmentBase = this._$helperService.segmentationBasePromo();
    eSegmentBase = SegmentationBasePromo;

    public subs: Subscription;
    public specifiedTarget = [
        {id: 1, label: 'None'},
        {id: 2, label: 'New Store'},
        {id: 3, label: 'Active Outlet Only'}];
    public benefitSetting = [];
    public statNewStore = false;
    public statActiveStore = false;
    public selectTargetId: number;
    public custWarehouse = [];
    public custType = [];
    public custGroup = [];
    public custCluster = [];
    public custChannel = [];

    constructor(
        private store: Store<fromCrossSellingPromos.FeatureState>,
        private _$helperService: HelperService,
        private crossSellingPromoApiService: CrossSellingPromoApiService,
        private cdRef: ChangeDetectorRef
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
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
                        return this.crossSellingPromoApiService
                        .findSegmentPromo<IPaginatedResponse<Entity>>(params, segment)
                            .pipe(
                                tap((response) =>
                                    HelperService.debug('FIND ENTITY request segment', {
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

        this.crossSellingPromo$ = this.store.select(CrossSellingPromoSelectors.getSelectedItem)
        .pipe(
            map((item) => {
                return item;
            })
        );

        this.subs = this.crossSellingPromo$.subscribe(val => {
            this.benefitSetting.push(val);
            this.statNewStore = this.benefitSetting[0].isNewStore;
            this.statActiveStore = this.benefitSetting[0].isActiveStore;
            if (this.statNewStore == false && this.statActiveStore == false){
                this.selectTargetId = 1;
            } else if (this.statNewStore == true && this.statActiveStore == false) {
                this.selectTargetId = 2;
            } else if (this.statNewStore == false && this.statActiveStore == true) {
                this.selectTargetId = 3;
            }
        });

        let params = {};

        if (
            this.benefitSetting[0].target == 'all'
        ) {
            
            params['catalogueSegmentationId'] = this.benefitSetting[0].catalogueSegmentationObjectId;
            params['supplierId'] = this.benefitSetting[0].supplierId;
            this.requestSegment(params, 'warehouse');
            this.requestSegment(params, 'type');
            this.requestSegment(params, 'group');
            this.requestSegment(params, 'channel');
            this.requestSegment(params, 'cluster');
            
        }

        this.cdRef.detectChanges();

        this.isLoading$ = this.store.select(CrossSellingPromoSelectors.getIsLoading);
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    getStores(value: IPromoStore[]): string {
        if (value && value.length > 0) {
            const store = value.map((v) => v.store.name + ' - ' + v.store.storeCode);

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
    
    getStoreChannelsSegmentOnly(value: IPromoChannel[]): string {
        if (value && value.length > 0) {
            const storeChannel = value.map((v) => v.channel.name);

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

    getStoreClustersSegmentOnly(value: IPromoCluster[]): string {
        if (value && value.length > 0) {
            const storeCluster = value.map((v) => v.cluster.name);

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

    getStoreGroupsSegmentOnly(value: IPromoGroup[]): string {
        if (value && value.length > 0) {
            const storeGroup = value.map((v) => v.group.name);

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

    getStoreTypesSegmentOnly(value: IPromoType[]): string {
        if (value && value.length > 0) {
            const storeType = value.map((v) => v.type.name);

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

    getWarehousesSegmentOnly(value: IPromoWarehouse[]): string {
        if (value && value.length > 0) {
            const warehouse = value.map((v) => v.warehouse.name);

            return warehouse.length > 0 ? warehouse.join(', ') : '-';
        }

        return '-';
    }

    ngOnDestroy(): void{
        this.subs.unsubscribe();
    }
}
