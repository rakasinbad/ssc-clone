import { TestBed } from '@angular/core/testing';

import { SegmentClusterService } from './segment-cluster.service';

describe('SegmentClusterService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SegmentClusterService = TestBed.get(SegmentClusterService);
    expect(service).toBeTruthy();
  });
});
