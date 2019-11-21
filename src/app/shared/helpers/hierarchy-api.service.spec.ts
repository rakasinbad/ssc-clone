import { TestBed } from '@angular/core/testing';

import { HierarchyApiService } from './hierarchy-api.service';

describe('HierarchyApiService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: HierarchyApiService = TestBed.get(HierarchyApiService);
    expect(service).toBeTruthy();
  });
});
