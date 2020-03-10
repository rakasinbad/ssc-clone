import * as LocationActions from './location.actions';
import * as WarehouseCoverageActions from './warehouse-coverage.actions';
import * as WarehouseUrbanActions from './warehouse-urban.actions';

type LocationFailureActionNames = LocationActions.failureActionNames;
type WarehouseFailureActionNames = WarehouseCoverageActions.failureActionNames | WarehouseUrbanActions.failureActionNames;

export {
    LocationActions,
    LocationFailureActionNames,
    WarehouseCoverageActions,
    WarehouseUrbanActions,
    WarehouseFailureActionNames,
};
