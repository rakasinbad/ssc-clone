import { TestBed } from '@angular/core/testing';

import { UrbanApiService } from './urban-api.service';

describe('UrbanApiService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: UrbanApiService = TestBed.get(UrbanApiService);
    expect(service).toBeTruthy();
  });
});
