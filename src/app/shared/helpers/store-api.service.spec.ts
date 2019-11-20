import { TestBed } from '@angular/core/testing';

import { StoreApiService } from './store-api.service';

describe('StoreApiService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: StoreApiService = TestBed.get(StoreApiService);
    expect(service).toBeTruthy();
  });
});
