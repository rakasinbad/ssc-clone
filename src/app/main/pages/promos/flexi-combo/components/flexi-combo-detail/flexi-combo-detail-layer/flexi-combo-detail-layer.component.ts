import {
    ChangeDetectionStrategy,
    Component,
    OnInit,
    OnDestroy,
    ChangeDetectorRef,
    ViewEncapsulation,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { FlexiCombo } from '../../../models';
import * as fromFlexiCombos from '../../../store/reducers';
import { FlexiComboSelectors } from '../../../store/selectors';
import { PromoAllocation } from 'app/shared/models/promo-allocation.model';
import { HelperService } from 'app/shared/helpers';
import * as _ from 'lodash';

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
    
    constructor(
        private store: Store<fromFlexiCombos.FeatureState>,
        private _$helperService: HelperService,
        private cdRef: ChangeDetectorRef,
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.

        this.flexiCombo$ = this.store.select(FlexiComboSelectors.getSelectedItem);
        
        this.isLoading$ = this.store.select(FlexiComboSelectors.getIsLoading);

        this.cdRef.detectChanges();

    }

    ngOnDestroy(): void {
    }

}