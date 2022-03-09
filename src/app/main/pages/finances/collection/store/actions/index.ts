import * as CollectionActions from './collection.actions';
import * as BillingActions from './billing.actions';
import * as RejectReasonActions from './reject-reason.action';

type CollectionFailureAction = CollectionActions.FailureActions;
type RejectReasonFailureAction = RejectReasonActions.FailureActions;

export { CollectionFailureAction, RejectReasonFailureAction, CollectionActions, BillingActions, RejectReasonActions };