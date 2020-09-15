import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Store } from '@ngrx/store';
import { HelperService } from 'app/shared/helpers';
import { SegmentationBase } from 'app/shared/models/segmentation-base.model';
import { Observable } from 'rxjs';

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

import { map } from 'rxjs/operators';
import * as _ from 'lodash';

@Component({
    selector: 'app-flexi-combo-detail-customer',
    templateUrl: './flexi-combo-detail-customer.component.html',
    styleUrls: ['./flexi-combo-detail-customer.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlexiComboDetailCustomerComponent implements OnInit {
    flexiCombo$: Observable<FlexiCombo>;
    isLoading$: Observable<boolean>;

    segmentBase = this._$helperService.segmentationBase();
    eSegmentBase = SegmentationBase;

    constructor(
        private store: Store<fromFlexiCombos.FeatureState>,
        private _$helperService: HelperService
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.

        this.flexiCombo$ = this.store.select(FlexiComboSelectors.getSelectedItem).pipe(
            map((item) => {
                console.log('isi item detail cs->', item)
                    // this.typePromoAlloc = item.promoAllocationType;
                    // for (let i = 0; i < 3; i++) {
                    //     if (this.typePromoAlloc === this.listPromoAlloc[i].value) {
                    //         this.listPromoAlloc[i].checked = true;
                    //     } else {
                    //         this.listPromoAlloc[i].checked = false;
                    //     }
                    // }
                return item;
            })
        );
        this.isLoading$ = this.store.select(FlexiComboSelectors.getIsLoading);

        console.log()
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

    getWarehouses(value: IPromoWarehouse[]): string {
        if (value && value.length > 0) {
            const warehouse = value.map((v) => v.warehouse.name);

            return warehouse.length > 0 ? warehouse.join(', ') : '-';
        }

        return '-';
    }
}
