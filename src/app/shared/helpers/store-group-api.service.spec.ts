import { TestBed } from '@angular/core/testing';

import { StoreGroupApiService } from './store-group-api.service';

describe('StoreGroupApiService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: StoreGroupApiService = TestBed.get(StoreGroupApiService);
    expect(service).toBeTruthy();
  });
});
