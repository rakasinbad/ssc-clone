import { TestBed } from '@angular/core/testing';

import { SegmentClusterApiService } from './segment-cluster-api.service';

describe('SegmentClusterApiService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SegmentClusterApiService = TestBed.get(SegmentClusterApiService);
    expect(service).toBeTruthy();
  });
});
