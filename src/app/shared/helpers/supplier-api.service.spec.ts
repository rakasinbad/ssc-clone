import { TestBed } from '@angular/core/testing';

import { SupplierApiService } from './supplier-api.service';

describe('SupplierApiService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SupplierApiService = TestBed.get(SupplierApiService);
    expect(service).toBeTruthy();
  });
});
