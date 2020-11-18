import { TestBed } from '@angular/core/testing';

import { SegmentChannelService } from './segment-channel.service';

describe('SegmentChannelService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SegmentChannelService = TestBed.get(SegmentChannelService);
    expect(service).toBeTruthy();
  });
});
