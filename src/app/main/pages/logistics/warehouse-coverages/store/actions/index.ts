import * as LocationActions from './location.actions';
import * as WarehouseCoverageActions from './warehouse-coverage.actions';

type LocationFailureActionNames = LocationActions.failureActionNames;
type WarehouseFailureActionNames = WarehouseCoverageActions.failureActionNames;

export {
    LocationActions,
    LocationFailureActionNames,
    WarehouseCoverageActions,
    WarehouseFailureActionNames,
};
