import { TestBed } from '@angular/core/testing';

import { PaymentStatusApiService } from './payment-status-api.service';

describe('PaymentStatusApiService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PaymentStatusApiService = TestBed.get(PaymentStatusApiService);
    expect(service).toBeTruthy();
  });
});
