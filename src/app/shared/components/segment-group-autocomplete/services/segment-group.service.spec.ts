import { TestBed } from '@angular/core/testing';

import { SegmentGroupService } from './segment-group.service';

describe('SegmentGroupService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SegmentGroupService = TestBed.get(SegmentGroupService);
    expect(service).toBeTruthy();
  });
});
