import { TestBed } from '@angular/core/testing';

import { MerchantEmployeeApiService } from './merchant-employee-api.service';

describe('MerchantEmployeeApiService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MerchantEmployeeApiService = TestBed.get(MerchantEmployeeApiService);
    expect(service).toBeTruthy();
  });
});
