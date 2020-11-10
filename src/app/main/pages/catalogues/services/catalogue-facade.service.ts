import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { IBreadcrumbs, IFooterActionConfig } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';
import { FormActions, UiActions } from 'app/shared/store/actions';
import { Observable } from 'rxjs';
import { CataloguesModule } from '../catalogues.module';
import { Catalogue, CataloguePrice } from '../models';
import { CatalogueActions } from '../store/actions';
import { fromCatalogue } from '../store/reducers';
import { CatalogueSelectors } from '../store/selectors';

@Injectable({ providedIn: CataloguesModule })
export class CatalogueFacadeService {
    catalogue$: Observable<Catalogue> = this.store.select(
        CatalogueSelectors.getSelectedCatalogueEntity
    );
    cataloguePrices$: Observable<CataloguePrice[]> = this.store.select(
        CatalogueSelectors.getCataloguePriceSettings
    );
    totalCataloguePrice$: Observable<number> = this.store.select(
        CatalogueSelectors.getTotalCataloguePriceSettings
    );
    isLoading$: Observable<boolean> = this.store.select(CatalogueSelectors.getIsLoading);
    isRefresh$: Observable<boolean> = this.store.select(CatalogueSelectors.getRefreshStatus);

    constructor(private store: Store<fromCatalogue.FeatureState>) {}

    getWithQuery(params: IQueryParams): void {
        this.store.dispatch(
            CatalogueActions.fetchCataloguePriceSettingsRequest({
                payload: params,
            })
        );
    }

    getCatalogueById(id: string): void {
        this.store.dispatch(
            CatalogueActions.fetchCatalogueRequest({
                payload: id,
            })
        );

        this.store.dispatch(
            CatalogueActions.setSelectedCatalogue({
                payload: id,
            })
        );
    }

    delete(id: string): void {
        this.store.dispatch(
            CatalogueActions.spliceCatalogue({
                payload: id,
            })
        );
    }

    updateCataloguePrice(priceSettingId: string, price: number, formIndex?: number): void {
        this.store.dispatch(
            CatalogueActions.updateCataloguePriceSettingRequest({
                payload: {
                    priceSettingId,
                    price,
                    formIndex,
                },
            })
        );
    }

    setRefresh(value: boolean): void {
        this.store.dispatch(CatalogueActions.setRefreshStatus({ status: value }));
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
