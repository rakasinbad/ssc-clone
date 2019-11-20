import { TestBed } from '@angular/core/testing';

import { ClusterApiService } from './cluster-api.service';

describe('ClusterApiService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ClusterApiService = TestBed.get(ClusterApiService);
    expect(service).toBeTruthy();
  });
});
