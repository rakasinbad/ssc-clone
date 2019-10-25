import { TestBed } from '@angular/core/testing';

import { MerchantApiService } from './merchant-api.service';

describe('MerchantApiService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MerchantApiService = TestBed.get(MerchantApiService);
    expect(service).toBeTruthy();
  });
});
