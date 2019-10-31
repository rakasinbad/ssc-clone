import { TestBed } from '@angular/core/testing';

import { CataloguesService } from './catalogues.service';

describe('CataloguesService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CataloguesService = TestBed.get(CataloguesService);
    expect(service).toBeTruthy();
  });
});
