import { TestBed } from '@angular/core/testing';

import { OrderParcelApiService } from './order-parcel-api.service';

describe('OrderParcelApiService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: OrderParcelApiService = TestBed.get(OrderParcelApiService);
    expect(service).toBeTruthy();
  });
});
