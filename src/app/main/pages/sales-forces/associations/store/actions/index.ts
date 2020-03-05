import * as AssociatedPortfolioActions from './associated-portfolio.actions';
import * as AssociatedStoreActions from './associated-store.actions';
import * as AssociationStoresActions from './association-store.actions';
import * as AssociationActions from './association.actions';
import * as SalesRepActions from './sales-rep.actions';
import * as StoreActions from './stores.actions';

type associationFailureActionNames =
    | AssociationActions.failureActionNames
    | AssociatedPortfolioActions.failureActionNames
    | AssociatedStoreActions.failureActionNames
    | StoreActions.failureActionNames;

export {
    AssociationActions,
    AssociationStoresActions,
    AssociatedPortfolioActions,
    SalesRepActions,
    StoreActions,
    AssociatedStoreActions,
    associationFailureActionNames
};
