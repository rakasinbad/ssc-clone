import * as ExportHistoryActions from './export-history.actions';
import * as ExportFilterActions from './export-filter.actions';

export { ExportHistoryActions, ExportFilterActions };

// Export Filter
type requestActionNames = ExportFilterActions.requestActionNames;
type failureActionNames = ExportFilterActions.failureActionNames;

// Export History
type requestHistoryActionNames = ExportHistoryActions.requestActionNames;
type failureHistoryActionNames = ExportHistoryActions.failureActionNames;

export {
    requestActionNames as exportRequestActionNames,
    failureActionNames as exportFailureActionNames,
    requestHistoryActionNames as exportHistoryRequestActionNames,
    failureHistoryActionNames as exportHistoryFailureActionNames
};
