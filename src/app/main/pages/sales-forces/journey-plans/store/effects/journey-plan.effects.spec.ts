import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable } from 'rxjs';

import { JourneyPlanEffects } from './journey-plan.effects';

describe('JourneyPlanEffects', () => {
  let actions$: Observable<any>;
  let effects: JourneyPlanEffects;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        JourneyPlanEffects,
        provideMockActions(() => actions$)
      ]
    });

    effects = TestBed.get<JourneyPlanEffects>(JourneyPlanEffects);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });
});
