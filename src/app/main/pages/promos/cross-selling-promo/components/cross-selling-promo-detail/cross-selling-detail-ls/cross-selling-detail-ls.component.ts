import { ChangeDetectionStrategy, Component, OnInit, OnDestroy, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Store } from '@ngrx/store';
import { ShowImageComponent } from 'app/shared/modals/show-image/show-image.component';
import { Observable, Subscription } from 'rxjs';

import { CrossSelling } from '../../../models';
import * as fromCrossSellingPromos from '../../../store/reducers';
import { CrossSellingPromoSelectors } from '../../../store/selectors';

import { HelperService } from 'app/shared/helpers';
import { PromoAllocationCross } from 'app/shared/models/promo-allocation.model';
import { map } from 'rxjs/operators';
import { IQueryParams } from 'app/shared/models/query.model';
import { CrossSellingPromoApiService } from '../../../services/cross-selling-promo-api.service';

@Component({
  selector: 'app-cross-selling-detail-ls',
  templateUrl: './cross-selling-detail-ls.component.html',
  styleUrls: ['./cross-selling-detail-ls.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CrossSellingDetailLsComponent implements OnInit, OnDestroy {
    crossSellingPromo$: Observable<CrossSelling>;
    isLoading$: Observable<boolean>;

    promoAllocationCross = this._$helperService.promoAllocationCross();
    ePromoAllocation = PromoAllocationCross;
   
    constructor(private matDialog: MatDialog, private store: Store<fromCrossSellingPromos.FeatureState>,
        private _$helperService: HelperService, 
        private cdRef: ChangeDetectorRef,
        private crossSellingPromoApiService: CrossSellingPromoApiService

        ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.
        this.crossSellingPromo$ = this.store.select(CrossSellingPromoSelectors.getSelectedItem);

        this.isLoading$ = this.store.select(CrossSellingPromoSelectors.getIsLoading);
    }

    ngOnDestroy(): void {
    }
}
