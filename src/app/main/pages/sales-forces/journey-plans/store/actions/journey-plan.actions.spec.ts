import * as JourneyPlanActions from './journey-plan.actions';

describe('JourneyPlan', () => {
  it('should create an instance', () => {
    expect(new JourneyPlanActions.LoadJourneyPlans()).toBeTruthy();
  });
});
