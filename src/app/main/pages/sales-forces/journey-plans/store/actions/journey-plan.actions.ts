import { Action } from '@ngrx/store';

export enum JourneyPlanActionTypes {
  LoadJourneyPlans = '[JourneyPlan] Load JourneyPlans',
  
  
}

export class LoadJourneyPlans implements Action {
  readonly type = JourneyPlanActionTypes.LoadJourneyPlans;
}


export type JourneyPlanActions = LoadJourneyPlans;
