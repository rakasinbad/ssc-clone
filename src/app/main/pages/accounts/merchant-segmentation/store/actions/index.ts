import * as StoreGroupActions from './store-group.actions';
import * as StoreTypeActions from './store-type.actions';

type StoreSegmentationFailureActions =
    | StoreTypeActions.FailureActions
    | StoreGroupActions.FailureActions;

export { StoreGroupActions, StoreTypeActions, StoreSegmentationFailureActions };
