import { TestBed } from '@angular/core/testing';

import { CreditLimitBalanceApiService } from './credit-limit-balance-api.service';

describe('CreditLimitBalanceApiService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CreditLimitBalanceApiService = TestBed.get(CreditLimitBalanceApiService);
    expect(service).toBeTruthy();
  });
});
