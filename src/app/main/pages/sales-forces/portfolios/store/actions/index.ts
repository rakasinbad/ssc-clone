import * as PortfolioActions from './portfolios.actions';
import * as StoreActions from './stores.actions';

type portfolioRequestActionNames = PortfolioActions.requestActionNames | StoreActions.requestActionNames;
type portfolioFailureActionNames = PortfolioActions.failureActionNames | StoreActions.failureActionNames;

export {
    PortfolioActions,
    StoreActions,
    portfolioRequestActionNames,
    portfolioFailureActionNames,
};
