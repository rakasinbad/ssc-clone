import * as BrandActions from './brand.actions';
import * as CatalogueDetailPageActions from './catalogue-detail-page.actions';
import * as CatalogueMaxOrderQtySegmentationActions from './catalogue-max-order-qty-segmentation.actions';
import * as CataloguePriceSegmentationActions from './catalogue-price-segmentation.actions';
import * as CatalogueTaxActions from './catalogue-tax.actions';
import * as CatalogueActions from './catalogue.actions';
import * as CatalogueMssSettingsActions from './catalogue-mss-settings.actions';

export {
    BrandActions,
    CatalogueDetailPageActions,
    CatalogueMaxOrderQtySegmentationActions,
    CataloguePriceSegmentationActions,
    CatalogueTaxActions,
    CatalogueActions,
    CatalogueMssSettingsActions,
};

export type CatalogueDetailPageFailureActions = CatalogueDetailPageActions.FailureActions;
export type CatalogueMaxOrderQtySegmentationFailureActions = CatalogueMaxOrderQtySegmentationActions.FailureActions;
export type CataloguePriceSegmentationFailureActions = CataloguePriceSegmentationActions.FailureActions;
export type CatalogueTaxFailureActions = CatalogueTaxActions.FailureActions;
export type FailureActionNames = CatalogueActions.FailureActionNames;
export type CatalogueMssSettingsFailureActions = CatalogueMssSettingsActions.FailureActions;
