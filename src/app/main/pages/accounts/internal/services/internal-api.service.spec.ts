import { TestBed } from '@angular/core/testing';

import { InternalApiService } from './internal-api.service';

describe('InternalApiService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: InternalApiService = TestBed.get(InternalApiService);
    expect(service).toBeTruthy();
  });
});
