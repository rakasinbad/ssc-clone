import { TestBed } from '@angular/core/testing';

import { OrderBrandCatalogueApiService } from './order-brand-catalogue-api.service';

describe('OrderBrandCatalogueApiService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: OrderBrandCatalogueApiService = TestBed.get(OrderBrandCatalogueApiService);
    expect(service).toBeTruthy();
  });
});
