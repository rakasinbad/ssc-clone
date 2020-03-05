import { Action, combineReducers } from '@ngrx/store';
import * as fromRoot from 'app/store/app.reducer';

// import * as fromSalesRepErrs from './error.reducer';
import * as fromSkuAssignments from './sku-assignments.reducer';
import * as fromSkuAssignmentsWarehouse from './sku-assignments-warehouse.reducer';
import * as fromSkuAssignmentsSku from './sku-assignments-sku.reducer';

const featureKey = 'skuAssignments';

interface State {
    [fromSkuAssignments.FEATURE_KEY]: fromSkuAssignments.SkuAssignmentsState;
    [fromSkuAssignmentsWarehouse.featureKey]: fromSkuAssignmentsWarehouse.State;
    [fromSkuAssignmentsSku.featureKey]: fromSkuAssignmentsSku.State;
}

interface FeatureState extends fromRoot.State {
    [featureKey]: State;
}

function reducers(state: State | undefined, action: Action): State {
    return combineReducers({
        [fromSkuAssignments.FEATURE_KEY]: fromSkuAssignments.reducer,
        [fromSkuAssignmentsWarehouse.featureKey]: fromSkuAssignmentsWarehouse.reducer,
        [fromSkuAssignmentsSku.featureKey]: fromSkuAssignmentsSku.reducer
    })(state, action);
}

export {
    fromSkuAssignments,
    fromSkuAssignmentsWarehouse,
    fromSkuAssignmentsSku,
    featureKey,
    FeatureState,
    reducers,
    State
};
