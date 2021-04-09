import * as BrandActions from './brand.actions';
import * as CatalogueDetailPageActions from './catalogue-detail-page.actions';
import * as CatalogueMaxOrderQtySegmentationActions from './catalogue-max-order-qty-segmentation.actions';
import * as CataloguePriceSegmentationActions from './catalogue-price-segmentation.actions';
import * as CatalogueActions from './catalogue.actions';

export {
    BrandActions,
    CatalogueDetailPageActions,
    CatalogueMaxOrderQtySegmentationActions,
    CataloguePriceSegmentationActions,
    CatalogueActions,
};

export type CatalogueDetailPageFailureActions = CatalogueDetailPageActions.FailureActions;
export type CatalogueMaxOrderQtySegmentationFailureActions = CatalogueMaxOrderQtySegmentationActions.FailureActions;
export type CataloguePriceSegmentationFailureActions = CataloguePriceSegmentationActions.FailureActions;
export type FailureActionNames = CatalogueActions.FailureActionNames;
