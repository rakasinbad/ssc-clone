import { TestBed } from '@angular/core/testing';

import { StoresApiService } from './stores-api.service';

describe('StoresApiService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: StoresApiService = TestBed.get(StoresApiService);
    expect(service).toBeTruthy();
  });
});
