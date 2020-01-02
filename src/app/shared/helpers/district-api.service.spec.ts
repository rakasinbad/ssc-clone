import { TestBed } from '@angular/core/testing';

import { DistrictApiService } from './district-api.service';

describe('DistrictApiService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DistrictApiService = TestBed.get(DistrictApiService);
    expect(service).toBeTruthy();
  });
});
