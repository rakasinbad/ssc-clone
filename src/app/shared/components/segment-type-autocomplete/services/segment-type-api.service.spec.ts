import { TestBed } from '@angular/core/testing';

import { SegmentTypeApiService } from './segment-type-api.service';

describe('SegmentTypeApiService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SegmentTypeApiService = TestBed.get(SegmentTypeApiService);
    expect(service).toBeTruthy();
  });
});
