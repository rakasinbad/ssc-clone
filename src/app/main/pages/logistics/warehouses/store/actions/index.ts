import * as WarehouseCoverageActions from './warehouse-coverage.actions';
import * as WarehouseActions from './warehouse.actions';

type WarehouseFailureActions =
    | WarehouseActions.FailureActions
    | WarehouseCoverageActions.FailureActions;

export { WarehouseActions, WarehouseCoverageActions, WarehouseFailureActions };
