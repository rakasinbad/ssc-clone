import { TestBed } from '@angular/core/testing';

import { InvoiceGroupApiService } from './invoice-group-api.service';

describe('InvoiceGroupApiService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: InvoiceGroupApiService = TestBed.get(InvoiceGroupApiService);
    expect(service).toBeTruthy();
  });
});
