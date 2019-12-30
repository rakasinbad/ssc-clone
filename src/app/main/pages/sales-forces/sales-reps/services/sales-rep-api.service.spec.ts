import { TestBed } from '@angular/core/testing';

import { SalesRepApiService } from './sales-rep-api.service';

describe('SalesRepApiService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SalesRepApiService = TestBed.get(SalesRepApiService);
    expect(service).toBeTruthy();
  });
});
