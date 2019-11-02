import { TestBed } from '@angular/core/testing';

import { StoreTypeApiService } from './store-type-api.service';

describe('StoreTypeApiService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: StoreTypeApiService = TestBed.get(StoreTypeApiService);
    expect(service).toBeTruthy();
  });
});
