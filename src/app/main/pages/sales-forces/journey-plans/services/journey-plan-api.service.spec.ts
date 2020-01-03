import { TestBed } from '@angular/core/testing';

import { JourneyPlanApiService } from './journey-plan-api.service';

describe('JourneyPlanApiService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: JourneyPlanApiService = TestBed.get(JourneyPlanApiService);
    expect(service).toBeTruthy();
  });
});
