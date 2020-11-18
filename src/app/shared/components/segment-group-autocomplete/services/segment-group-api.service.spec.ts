import { TestBed } from '@angular/core/testing';

import { SegmentGroupApiService } from './segment-group-api.service';

describe('SegmentGroupApiService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SegmentGroupApiService = TestBed.get(SegmentGroupApiService);
    expect(service).toBeTruthy();
  });
});
