import { TestBed } from '@angular/core/testing';

import { SupplierInventoryApiService } from './supplier-inventory-api.service';

describe('SupplierInventoryApiService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SupplierInventoryApiService = TestBed.get(SupplierInventoryApiService);
    expect(service).toBeTruthy();
  });
});
