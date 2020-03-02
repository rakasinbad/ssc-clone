import * as DropdownActions from './dropdown.actions';
import * as FormActions from './form.actions';
import * as NetworkActions from './network.actions';
import * as PortfolioActions from './portfolio.actions';
import * as ProgressActions from './progress.actions';
import * as TeamActions from './team.actions';
import * as TemperatureActions from './temperature.actions';
import * as UiActions from './ui.actions';
import * as WarehouseActions from './warehouse.actions';
import * as WarehouseValueActions from './warehouse-value.actions';

type FailureActions =
    | TemperatureActions.FailureActions
    | WarehouseActions.FailureActions
    | WarehouseValueActions.FailureActions;

export {
    DropdownActions,
    FailureActions,
    FormActions,
    NetworkActions,
    PortfolioActions,
    ProgressActions,
    TeamActions,
    TemperatureActions,
    UiActions,
    WarehouseActions,
    WarehouseValueActions
};
