import * as PortfolioActions from './portfolio.actions';

describe('Portfolio', () => {
  it('should create an instance', () => {
    expect(new PortfolioActions.LoadPortfolios()).toBeTruthy();
  });
});
