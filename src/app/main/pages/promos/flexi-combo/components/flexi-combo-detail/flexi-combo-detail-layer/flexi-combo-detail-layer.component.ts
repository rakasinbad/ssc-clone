import {
    ChangeDetectionStrategy,
    Component,
    OnInit,
    OnDestroy,
    ChangeDetectorRef,
    ViewEncapsulation,
} from '@angular/core';
import { MatDialog } from '@angular/material';
import { Store } from '@ngrx/store';
import { ShowImageComponent } from 'app/shared/modals/show-image/show-image.component';
import { Observable } from 'rxjs';

import { FlexiCombo } from '../../../models';
import * as fromFlexiCombos from '../../../store/reducers';
import { FlexiComboSelectors } from '../../../store/selectors';

import { Subscription } from 'rxjs';
import { PromoAllocation } from 'app/shared/models/promo-allocation.model';
import { HelperService } from 'app/shared/helpers';
import { map } from 'rxjs/operators';
import * as _ from 'lodash';
import { FlexiComboApiService } from '../../../services/flexi-combo-api.service';
import { IQueryParams } from 'app/shared/models/query.model';

@Component({
  selector: 'app-flexi-combo-detail-layer',
  templateUrl: './flexi-combo-detail-layer.component.html',
  styleUrls: ['./flexi-combo-detail-layer.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlexiComboDetailLayerComponent implements OnInit, OnDestroy {
    flexiCombo$: Observable<FlexiCombo>;
    isLoading$: Observable<boolean>;

    promoAllocation = this._$helperService.promoAllocation();
    ePromoAllocation = PromoAllocation;
    
    public typePromoAlloc: string;
    public subsFlexi: Subscription;
    public detailSkpSubs: Subscription;
    public subs: Subscription;

    skpId: string;
    promoDetail = [];
    skpName: string;

    constructor(
        private matDialog: MatDialog,
        private store: Store<fromFlexiCombos.FeatureState>,
        private _$helperService: HelperService,
        private cdRef: ChangeDetectorRef,
        private flexiComboApiService: FlexiComboApiService
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.

        this.flexiCombo$ = this.store.select(FlexiComboSelectors.getSelectedItem);
        this.subs = this.flexiCombo$.subscribe((val) => {
            if (val != undefined) {
                this.promoDetail.push(val);
                this.skpId = this.promoDetail[0].skpId;
                if (this.skpId != null) {
                    const params: IQueryParams = {};
                    this.detailSkpSubs = this.flexiComboApiService.findByIdSkp(this.skpId, params).subscribe(res => {
                        this.skpName = res['name'];
                        this.cdRef.markForCheck();
                    });
                }
               
            }
            
        });

        
        this.isLoading$ = this.store.select(FlexiComboSelectors.getIsLoading);

        this.cdRef.detectChanges();

    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    onShowImage(imageUrl: string, title: string): void {
        if (!imageUrl || !title) {
            return;
        }

        this.matDialog.open(ShowImageComponent, {
            data: {
                title: title || '',
                url: imageUrl || '',
            },
            disableClose: true,
        });
    }

    ngOnDestroy(): void {
        this.subs.unsubscribe();
        if (this.skpId != null) {
            this.detailSkpSubs.unsubscribe();
        }
    }

}