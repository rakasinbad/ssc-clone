import { TestBed } from '@angular/core/testing';

import { CreditLimitGroupApiService } from './credit-limit-group-api.service';

describe('CreditLimitGroupApiService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CreditLimitGroupApiService = TestBed.get(CreditLimitGroupApiService);
    expect(service).toBeTruthy();
  });
});
