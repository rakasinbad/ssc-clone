import { ChangeDetectionStrategy, Component, OnInit, AfterViewInit, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { Store } from '@ngrx/store';
import { HelperService } from 'app/shared/helpers';
import { SegmentationBasePromo } from 'app/shared/models/segmentation-base.model';
import { SpecifiedTarget } from 'app/shared/models/specified-target.model';
import { Observable, Subscription } from 'rxjs';

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
import { TNullable, IPaginatedResponse, ErrorHandler } from 'app/shared/models/global.model';
import { map } from 'rxjs/operators';
import * as _ from 'lodash';

@Component({
    selector: 'app-flexi-combo-detail-customer',
    templateUrl: './flexi-combo-detail-customer.component.html',
    styleUrls: ['./flexi-combo-detail-customer.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlexiComboDetailCustomerComponent implements OnInit, AfterViewInit {
    flexiCombo$: Observable<FlexiCombo>;
    isLoading$: Observable<boolean>;

    segmentBase = this._$helperService.segmentationBasePromo();
    eSegmentBase = SegmentationBasePromo;
    specifiedTargets = this._$helperService.specifiedTarget();
    eSpecifiedTargets = SpecifiedTarget;

    public subs: Subscription;
    public subsDetail: Subscription;
    public benefitSetting = [];
    public statNewStore = false;
    public statActiveStore = false;
    public specifiedTargetValue = 'none';
    public warehouseLength: string = '';
    public warehouseList: string = '';

    constructor(
        private store: Store<fromFlexiCombos.FeatureState>,
        private _$helperService: HelperService,
        private flexiComboApiService: FlexiComboApiService
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.
        this.flexiCombo$ = this.store.select(FlexiComboSelectors.getSelectedItem).pipe(
            map((item) => {
                return item;
            })
        );
        this.subs = this.flexiCombo$.subscribe(val => {
            this.benefitSetting.push(val);
            this.statNewStore = this.benefitSetting[0].isNewStore;
            this.statActiveStore = this.benefitSetting[0].isActiveStore;
            if (this.statNewStore == false && this.statActiveStore == false){
                this.specifiedTargetValue = 'none';
            } else if (this.statNewStore == true && this.statActiveStore == false) {
                this.specifiedTargetValue = 'isNewStore';
            } else if (this.statNewStore == false && this.statActiveStore == true) {
                this.specifiedTargetValue = 'isActiveStore';
            }
        });
        this.isLoading$ = this.store.select(FlexiComboSelectors.getIsLoading);

    }

    ngAfterViewInit(): void {
        let params = {};

        if (this.benefitSetting[0].base == 'sku') {
            let sku = this.benefitSetting[0].promoCatalogues;
            let idSku = [];
            idSku = sku.map((item) => (item.catalogueId));
            params['catalogueId'] = idSku.toString();
            params['supplierId'] = this.benefitSetting[0].supplierId;
            this.subsDetail = this.flexiComboApiService.findSegmentPromo<IPaginatedResponse<Entity>>(params, 'warehouse').subscribe(res => {
                this.warehouseLength = res.total.toString();
                let whList = [];
                whList = res['data'].map((res) => (res.warehouseName));
                this.warehouseList = whList.toString();
                // addedAvailableEntities = (res as Array<Entity>).map(d => ({ id: d.warehouseId, label: d.warehouseName, group: 'warehouses' }));
            });
            this.subsDetail = this.flexiComboApiService.findSegmentPromo<IPaginatedResponse<Entity>>(params, 'type').subscribe(res => {
                // addedAvailableEntities = (res as Array<Entity>).map(d => ({ id: d.warehouseId, label: d.warehouseName, group: 'warehouses' }));
            });
        } else if (this.benefitSetting[0].base == 'brand') {
            let brand = this.benefitSetting[0].promoBrands;
            let idBrand = [];
            idBrand = brand.map((item) => (item.invoiceGroupId));
            params['brandId'] = idBrand.toString();
            params['supplierId'] = this.benefitSetting[0].supplierId;
            this.subsDetail = this.flexiComboApiService.findSegmentPromo<IPaginatedResponse<Entity>>(params, 'warehouse').subscribe(res => {
                this.warehouseLength = res.total.toString();
                let whList = [];
                whList = res['data'].map((res) => (res.warehouseName));
                this.warehouseList = whList.toString();
                // addedAvailableEntities = (res as Array<Entity>).map(d => ({ id: d.warehouseId, label: d.warehouseName, group: 'warehouses' }));
            });
            this.subsDetail = this.flexiComboApiService.findSegmentPromo<IPaginatedResponse<Entity>>(params, 'type').subscribe(res => {
                // addedAvailableEntities = (res as Array<Entity>).map(d => ({ id: d.warehouseId, label: d.warehouseName, group: 'warehouses' }));
            });

        } else if (this.benefitSetting[0].base == 'invoice_group') {
            let ev = this.benefitSetting[0].promoInvoiceGroups;
            let idFaktur = [];
            idFaktur = ev.map((item) => (item.invoiceGroupId));
            params['fakturId'] = idFaktur.toString();
            params['supplierId'] = this.benefitSetting[0].supplierId;
            this.subsDetail = this.flexiComboApiService.findSegmentPromo<IPaginatedResponse<Entity>>(params, 'warehouse').subscribe(res => {
                this.warehouseLength = res.total.toString();
                let whList = [];
                whList = res['data'].map((res) => (res.warehouseName));
                this.warehouseList = whList.toString();
                // addedAvailableEntities = (res as Array<Entity>).map(d => ({ id: d.warehouseId, label: d.warehouseName, group: 'warehouses' }));
            });
            this.subsDetail = this.flexiComboApiService.findSegmentPromo<IPaginatedResponse<Entity>>(params, 'type').subscribe(res => {
                // addedAvailableEntities = (res as Array<Entity>).map(d => ({ id: d.warehouseId, label: d.warehouseName, group: 'warehouses' }));
            });
        }
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

    getStoreChannels(value: IPromoChannel[]): string {
        if (value && value.length > 0) {
            const storeChannel = value.map((v) => v.channel.name);

            return storeChannel.length > 0 ? storeChannel.join(', ') : '-';
        }

        return '-';
    }

    getStoreClusters(value: IPromoCluster[]): string {
        if (value && value.length > 0) {
            const storeCluster = value.map((v) => v.cluster.name);

            return storeCluster.length > 0 ? storeCluster.join(', ') : '-';
        }

        return '-';
    }

    getStoreGroups(value: IPromoGroup[]): string {
        if (value && value.length > 0) {
            const storeGroup = value.map((v) => v.group.name);

            return storeGroup.length > 0 ? storeGroup.join(', ') : '-';
        }

        return '-';
    }

    getStoreTypes(value: IPromoType[]): string {
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

    ngOnDestroy(): void{
        this.subs.unsubscribe();
        this.subsDetail.unsubscribe();
    }
}
