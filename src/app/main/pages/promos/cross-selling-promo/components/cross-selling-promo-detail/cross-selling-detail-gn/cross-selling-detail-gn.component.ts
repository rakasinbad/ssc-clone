import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Store } from '@ngrx/store';
import { ShowImageComponent } from 'app/shared/modals/show-image/show-image.component';
import { Observable } from 'rxjs';

import { CrossSelling } from '../../../models';
import * as fromCrossSellingPromos from '../../../store/reducers';
import { CrossSellingPromoSelectors } from '../../../store/selectors';

import { HelperService } from 'app/shared/helpers';
import { PromoAllocationCross } from 'app/shared/models/promo-allocation.model';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-cross-selling-detail-gn',
  templateUrl: './cross-selling-detail-gn.component.html',
  styleUrls: ['./cross-selling-detail-gn.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CrossSellingDetailGnComponent implements OnInit {
    crossSellingPromo$: Observable<CrossSelling>;
    isLoading$: Observable<boolean>;

    promoAllocationCross = this._$helperService.promoAllocationCross();
    ePromoAllocation = PromoAllocationCross;
    public typePromoAlloc: string = 'promo_budget';

    constructor(private matDialog: MatDialog, private store: Store<fromCrossSellingPromos.FeatureState>,
        private _$helperService: HelperService,
        ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.

        this.crossSellingPromo$ = this.store.select(CrossSellingPromoSelectors.getSelectedItem).pipe(
            map((item) => {
                    // this.typePromoAlloc = item.promoAllocationType;
                    this.typePromoAlloc = 'promo_budget';
                return item;
            })
        );
        this.isLoading$ = this.store.select(CrossSellingPromoSelectors.getIsLoading);
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

}
