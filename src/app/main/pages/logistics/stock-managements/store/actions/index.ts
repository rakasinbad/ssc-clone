import * as StockManagementCatalogueActions from './stock-management-catalogue.actions';
import * as StockManagementGeneralActions from './stock-management-general.actions';
import * as StockManagementHistoryActions from './stock-management-history.actions';
import * as StockManagementActions from './stock-management.actions';

type StockManagementFailureActions =
    | StockManagementActions.FailureActions
    | StockManagementGeneralActions.FailureActions
    | StockManagementHistoryActions.FailureActions
    | StockManagementCatalogueActions.FailureActions;

export {
    StockManagementActions,
    StockManagementCatalogueActions,
    StockManagementGeneralActions,
    StockManagementHistoryActions,
    StockManagementFailureActions
};
