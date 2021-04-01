import * as BrandActions from './brand.actions';
import * as CatalogueDetailPageActions from './catalogue-detail-page.actions';
import * as CataloguePriceSegmentationActions from './catalogue-price-segmentation.actions';
import * as CatalogueTaxActions from './catalogue-tax.actions';
import * as CatalogueActions from './catalogue.actions';

export {
    BrandActions,
    CatalogueDetailPageActions,
    CataloguePriceSegmentationActions,
    CatalogueTaxActions,
    CatalogueActions,
};

export type CatalogueDetailPageFailureActions = CatalogueDetailPageActions.FailureActions;
export type CataloguePriceSegmentationFailureActions = CataloguePriceSegmentationActions.FailureActions;
export type CatalogueTaxFailureActions = CatalogueTaxActions.FailureActions;
export type FailureActionNames = CatalogueActions.FailureActionNames;
