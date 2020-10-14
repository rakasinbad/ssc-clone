import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { IBreadcrumbs, IFooterActionConfig } from 'app/shared/models/global.model';
import { InvoiceGroup } from 'app/shared/models/invoice-group.model';
import { DropdownActions, FormActions, UiActions } from 'app/shared/store/actions';
import { DropdownSelectors, FormSelectors } from 'app/shared/store/selectors';
import { Observable } from 'rxjs';
import { CrossSellingPromoModule } from '../cross-selling-promo.module';
import { CreateFormDto } from '../models';
import { CrossSellingPromoActions } from '../store/actions';
import * as fromCrossSellingPromo from '../store/reducers';

@Injectable({ providedIn: CrossSellingPromoModule })
export class CrossSellingPromoFacadeService {
    clickCancelBtn$: Observable<boolean> = this.store.select(FormSelectors.getIsClickCancelButton);
    clickSaveBtn$: Observable<boolean> = this.store.select(FormSelectors.getIsClickSaveButton);
    invoiceGroups$: Observable<InvoiceGroup[]> = this.store.select(
        DropdownSelectors.getInvoiceGroupDropdownState
    );

    constructor(private store: Store<fromCrossSellingPromo.FeatureState>) {}

    create(payload: CreateFormDto): void {
        this.store.dispatch(CrossSellingPromoActions.createCrossSellingPromoRequest({ payload }));
    }

    getInvoiceGroup(): void {
        this.store.dispatch(DropdownActions.fetchDropdownInvoiceGroupRequest());
    }

    createBreadcrumb(breadcrumbs: IBreadcrumbs[]): void {
        this.store.dispatch(UiActions.createBreadcrumb({ payload: breadcrumbs }));
    }

    clearBreadcrumb(): void {
        this.store.dispatch(UiActions.resetBreadcrumb());
    }

    setCancelButton(): void {
        this.store.dispatch(FormActions.setCancelButtonAction({ payload: 'CANCEL' }));
    }

    setFooterConfig(config: IFooterActionConfig): void {
        this.store.dispatch(UiActions.setFooterActionConfig({ payload: config }));
    }

    showFooter(): void {
        this.store.dispatch(UiActions.showFooterAction());
    }

    hideFooter(): void {
        this.store.dispatch(UiActions.hideFooterAction());
    }

    setFormValid(): void {
        this.store.dispatch(FormActions.setFormStatusValid());
    }

    setFormInvalid(): void {
        this.store.dispatch(FormActions.setFormStatusInvalid());
    }

    resetCancelBtn(): void {
        this.store.dispatch(FormActions.resetClickCancelButton());
        this.store.dispatch(FormActions.resetCancelButtonAction());
    }

    resetFormStatus(): void {
        this.store.dispatch(FormActions.resetFormStatus());
    }

    resetSaveBtn(): void {
        this.store.dispatch(FormActions.resetClickSaveButton());
    }

    resetAllFooter(): void {
        this.resetCancelBtn();
        this.resetFormStatus();
        this.resetSaveBtn();
    }
}
