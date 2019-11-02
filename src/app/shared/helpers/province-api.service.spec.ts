import { TestBed } from '@angular/core/testing';

import { ProvinceApiService } from './province-api.service';

describe('ProvinceApiService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ProvinceApiService = TestBed.get(ProvinceApiService);
    expect(service).toBeTruthy();
  });
});
