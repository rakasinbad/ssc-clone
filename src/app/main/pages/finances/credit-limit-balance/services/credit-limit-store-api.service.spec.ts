import { TestBed } from '@angular/core/testing';

import { CreditLimitStoreApiService } from './credit-limit-store-api.service';

describe('CreditLimitStoreApiService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CreditLimitStoreApiService = TestBed.get(CreditLimitStoreApiService);
    expect(service).toBeTruthy();
  });
});
