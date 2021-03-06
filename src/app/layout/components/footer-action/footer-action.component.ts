import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { IFooterActionConfig } from 'app/shared/models/global.model';
import { FormActions } from 'app/shared/store/actions';
import { FormSelectors, UiSelectors } from 'app/shared/store/selectors';
import * as fromRoot from 'app/store/app.reducer';
import { Observable } from 'rxjs';

@Component({
    selector: 'footer-action',
    templateUrl: './footer-action.component.html',
    styleUrls: ['./footer-action.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FooterActionComponent implements OnInit {
    config$: Observable<IFooterActionConfig>;
    cancelButtonAction$: Observable<string>;
    isShowSaveButton$: Observable<boolean>;
    isValidForm$: Observable<boolean>;

    constructor(private store: Store<fromRoot.State>) {}

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.

        this.config$ = this.store.select(UiSelectors.getFooterActionConfig);
        this.cancelButtonAction$ = this.store.select(FormSelectors.getCancelButtonAction);
        this.isShowSaveButton$ = this.store.select(FormSelectors.getIsShowSaveButton);
        this.isValidForm$ = this.store.select(FormSelectors.getIsValidForm);
    }

    onCancel(action?: string): void {
        if (action) {
            switch (action) {
                case 'CANCEL':
                    this.store.dispatch(FormActions.clickCancelButton());
                    break;

                case 'RESET':
                    this.store.dispatch(FormActions.clickResetButton());
                    break;

                default:
                    return;
            }
        }
    }

    onSave(): void {
        this.store.dispatch(FormActions.clickSaveButton());
    }
}
