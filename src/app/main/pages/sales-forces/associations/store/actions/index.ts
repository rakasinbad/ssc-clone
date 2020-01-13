import * as AssociationActions from './association.actions';
import * as AssociationStoresActions from './association-store.actions';
import * as SalesRepActions from './sales-rep.actions';
import * as AssociatedPortfolioActions from './portfolio.actions';

type associationFailureActionNames =
    AssociationActions.failureActionNames |
    AssociatedPortfolioActions.failureActionNames
;

export { AssociationActions, AssociationStoresActions, AssociatedPortfolioActions, SalesRepActions, associationFailureActionNames };
