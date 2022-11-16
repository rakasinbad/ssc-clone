import * as StoreChannelActions from './store-channel.actions';
import * as StoreClusterActions from './store-cluster.actions';
import * as StoreGroupActions from './store-group.actions';
import * as StoreAlertActions from './store-segment.actions';
import * as StoreTypeActions from './store-type.actions';

type StoreSegmentationFailureActions =
    | StoreAlertActions.FailureActions
    | StoreChannelActions.FailureActions
    | StoreClusterActions.FailureActions
    | StoreGroupActions.FailureActions
    | StoreTypeActions.FailureActions;

export {
    StoreAlertActions,
    StoreChannelActions,
    StoreClusterActions,
    StoreGroupActions,
    StoreTypeActions,
    StoreSegmentationFailureActions
};
