import { TestBed } from '@angular/core/testing';

import { SegmentChannelApiService } from './segment-channel-api.service';

describe('SegmentChannelApiService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SegmentChannelApiService = TestBed.get(SegmentChannelApiService);
    expect(service).toBeTruthy();
  });
});
