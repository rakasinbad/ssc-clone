import { TestBed } from '@angular/core/testing';

import { StoreClusterApiService } from './store-cluster-api.service';

describe('StoreClusterApiService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: StoreClusterApiService = TestBed.get(StoreClusterApiService);
    expect(service).toBeTruthy();
  });
});
