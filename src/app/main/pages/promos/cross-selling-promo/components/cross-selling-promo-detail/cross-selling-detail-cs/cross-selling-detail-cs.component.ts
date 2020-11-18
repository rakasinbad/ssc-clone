import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Store } from '@ngrx/store';
import { HelperService } from 'app/shared/helpers';
import { SegmentationBasePromo } from 'app/shared/models/segmentation-base.model';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
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

    constructor(
        private store: Store<fromCrossSellingPromos.FeatureState>,
        private _$helperService: HelperService
    ) {}

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
        this.isLoading$ = this.store.select(CrossSellingPromoSelectors.getIsLoading);
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

    ngOnDestroy(): void{
        this.subs.unsubscribe();
    }
}
