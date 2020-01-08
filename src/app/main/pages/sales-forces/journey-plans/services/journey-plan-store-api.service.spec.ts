import { TestBed } from '@angular/core/testing';

import { JourneyPlanStoreApiService } from './journey-plan-store-api.service';

describe('JourneyPlanStoreApiService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: JourneyPlanStoreApiService = TestBed.get(JourneyPlanStoreApiService);
    expect(service).toBeTruthy();
  });
});
