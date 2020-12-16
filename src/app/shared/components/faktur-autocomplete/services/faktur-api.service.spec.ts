import { TestBed } from '@angular/core/testing';

import { FakturApiService } from './faktur-api.service';

describe('FakturApiService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: FakturApiService = TestBed.get(FakturApiService);
    expect(service).toBeTruthy();
  });
});
