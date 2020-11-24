import { TestBed } from '@angular/core/testing';

import { BrandApiService } from './brand-api.service';

describe('BrandApiService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: BrandApiService = TestBed.get(BrandApiService);
    expect(service).toBeTruthy();
  });
});
