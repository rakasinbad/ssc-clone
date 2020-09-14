import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Store } from '@ngrx/store';
import { ShowImageComponent } from 'app/shared/modals/show-image/show-image.component';
import { Observable } from 'rxjs';

import { FlexiCombo } from '../../../models';
import * as fromFlexiCombos from '../../../store/reducers';
import { FlexiComboSelectors } from '../../../store/selectors';

@Component({
    selector: 'app-flexi-combo-detail-general',
    templateUrl: './flexi-combo-detail-general.component.html',
    styleUrls: ['./flexi-combo-detail-general.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlexiComboDetailGeneralComponent implements OnInit {
    flexiCombo$: Observable<FlexiCombo>;
    isLoading$: Observable<boolean>;

    public listPromoAlloc: any = [
        { label: 'None', value: 'none', checked: true },
        { label: 'Promo Budget', value: 'promo_budget', checked: false },
        { label: 'Promo Slot', value: 'promo_slot', checked: false },
    ];

    constructor(private matDialog: MatDialog, private store: Store<fromFlexiCombos.FeatureState>) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.

        this.flexiCombo$ = this.store.select(FlexiComboSelectors.getSelectedItem);
        this.isLoading$ = this.store.select(FlexiComboSelectors.getIsLoading);

        this.flexiCombo$.subscribe(
            (res) => {
                for (let i = 0; i < 3; i++) {
                    if (res.promoAllocationType == this.listPromoAlloc[i].value) {
                        this.listPromoAlloc[i].checked = true;
                    } else {
                        this.listPromoAlloc[i].checked = false;
                    }
                }
            }
        );

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
