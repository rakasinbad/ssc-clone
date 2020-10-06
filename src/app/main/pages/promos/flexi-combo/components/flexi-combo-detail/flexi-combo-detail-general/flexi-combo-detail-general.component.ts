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

    constructor(private matDialog: MatDialog, private store: Store<fromFlexiCombos.FeatureState>) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.

        this.flexiCombo$ = this.store.select(FlexiComboSelectors.getSelectedItem);
        this.isLoading$ = this.store.select(FlexiComboSelectors.getIsLoading);
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
