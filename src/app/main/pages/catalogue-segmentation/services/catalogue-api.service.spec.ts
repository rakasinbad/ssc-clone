import { TestBed } from '@angular/core/testing';

import { CatalogueApiService } from './catalogue-api.service';

describe('CatalogueApiService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CatalogueApiService = TestBed.get(CatalogueApiService);
    expect(service).toBeTruthy();
  });
});
