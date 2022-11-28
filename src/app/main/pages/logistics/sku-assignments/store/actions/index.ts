import * as SkuAssignmentsActions from './sku-assignments.actions';
import * as SkuAssignmentsWarehouseActions from './sku-assignments-warehouse.actions';
import * as SkuAssignmentsSkuActions from './sku-assignments-sku.actions';
import * as WarehouseCatalogueActions from './warehouse-catalogue.actions';

type failureActionNames = SkuAssignmentsActions.failureActionNames | WarehouseCatalogueActions.failureActionNames;
type requestActionNames = SkuAssignmentsActions.requestActionNames | WarehouseCatalogueActions.requestActionNames;

export {
    failureActionNames,
    requestActionNames,
    SkuAssignmentsActions,
    SkuAssignmentsWarehouseActions,
    SkuAssignmentsSkuActions,
    WarehouseCatalogueActions,
};
