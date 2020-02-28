import * as WarehouseCoverageActions from './warehouse-coverage.actions';
import * as WarehouseSkuStockActions from './warehouse-sku-stock.actions';
import * as WarehouseActions from './warehouse.actions';

type WarehouseFailureActions =
    | WarehouseActions.FailureActions
    | WarehouseCoverageActions.FailureActions
    | WarehouseSkuStockActions.FailureActions;

export {
    WarehouseActions,
    WarehouseCoverageActions,
    WarehouseFailureActions,
    WarehouseSkuStockActions
};
