import { Action, combineReducers } from '@ngrx/store';
import * as fromRoot from 'app/store/app.reducer';
import * as fromCatalogueSegmentationData from './data-catalogue-segmentation.reducer';

export const catalogueSegmentationFeatureKey = 'catalogueSegmentation';

export interface State {
    [fromCatalogueSegmentationData.dataCatalogueSegmentationFeatureKey]: fromCatalogueSegmentationData.State;
}

export interface FeatureState extends fromRoot.State {
    [catalogueSegmentationFeatureKey]: State | undefined;
}

export function reducers(state: State | undefined, action: Action): State {
    return combineReducers({
        [fromCatalogueSegmentationData.dataCatalogueSegmentationFeatureKey]:
            fromCatalogueSegmentationData.reducer,
    })(state, action);
}
