import { TestBed } from '@angular/core/testing';

import { StoreSegmentApiService } from './store-segment-api.service';

describe('StoreSegmentApiService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: StoreSegmentApiService = TestBed.get(StoreSegmentApiService);
    expect(service).toBeTruthy();
  });
});
