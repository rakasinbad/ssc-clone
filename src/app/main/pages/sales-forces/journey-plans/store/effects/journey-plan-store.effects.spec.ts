import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable } from 'rxjs';

import { JourneyPlanStoreEffects } from './journey-plan-store.effects';

describe('JourneyPlanStoreEffects', () => {
  let actions$: Observable<any>;
  let effects: JourneyPlanStoreEffects;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        JourneyPlanStoreEffects,
        provideMockActions(() => actions$)
      ]
    });

    effects = TestBed.get<JourneyPlanStoreEffects>(JourneyPlanStoreEffects);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });
});
