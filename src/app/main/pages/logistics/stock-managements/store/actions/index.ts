import * as StockManagementCatalogueActions from './stock-management-catalogue.actions';
import * as StockManagementActions from './stock-management.actions';

type StockManagementFailureActions =
    | StockManagementActions.FailureActions
    | StockManagementCatalogueActions.FailureActions;

export { StockManagementActions, StockManagementCatalogueActions, StockManagementFailureActions };
