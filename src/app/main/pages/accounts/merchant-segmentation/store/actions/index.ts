import * as StoreChannelActions from './store-channel.actions';
import * as StoreClusterActions from './store-cluster.actions';
import * as StoreGroupActions from './store-group.actions';
import * as StoreTypeActions from './store-type.actions';

type StoreSegmentationFailureActions =
    | StoreChannelActions.FailureActions
    | StoreClusterActions.FailureActions
    | StoreGroupActions.FailureActions
    | StoreTypeActions.FailureActions;

export {
    StoreChannelActions,
    StoreClusterActions,
    StoreGroupActions,
    StoreTypeActions,
    StoreSegmentationFailureActions
};
