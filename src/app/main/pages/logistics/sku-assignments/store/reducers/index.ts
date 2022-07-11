import { Action, combineReducers } from '@ngrx/store';
import * as fromRoot from 'app/store/app.reducer';

// import * as fromSalesRepErrs from './error.reducer';
import * as fromSkuAssignments from './sku-assignments.reducer';
import * as fromSkuAssignmentsWarehouse from './sku-assignments-warehouse.reducer';
import * as fromSkuAssignmentsSku from './sku-assignments-sku.reducer';
import * as fromWarehouseCatalogue from './warehouse-catalogue.reducer';

const featureKey = 'skuAssignments';

interface State {
    [fromSkuAssignments.FEATURE_KEY]: fromSkuAssignments.SkuAssignmentsState;
    [fromSkuAssignmentsWarehouse.featureKey]: fromSkuAssignmentsWarehouse.State;
    [fromSkuAssignmentsSku.featureKey]: fromSkuAssignmentsSku.State;
    [fromWarehouseCatalogue.featureKey]: fromWarehouseCatalogue.State;
}

interface FeatureState extends fromRoot.State {
    [featureKey]: State;
}

function reducers(state: State | undefined, action: Action): State {
    return combineReducers({
        [fromSkuAssignments.FEATURE_KEY]: fromSkuAssignments.reducer,
        [fromSkuAssignmentsWarehouse.featureKey]: fromSkuAssignmentsWarehouse.reducer,
        [fromSkuAssignmentsSku.featureKey]: fromSkuAssignmentsSku.reducer,
        [fromWarehouseCatalogue.featureKey]: fromWarehouseCatalogue.reducer
    })(state, action);
}

export {
    fromSkuAssignments,
    fromSkuAssignmentsWarehouse,
    fromSkuAssignmentsSku,
    fromWarehouseCatalogue,
    featureKey,
    FeatureState,
    reducers,
    State
};
