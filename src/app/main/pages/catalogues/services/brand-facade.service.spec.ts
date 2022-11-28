import { TestBed } from '@angular/core/testing';

import { BrandFacadeService } from './brand-facade.service';

describe('BrandFacadeService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: BrandFacadeService = TestBed.get(BrandFacadeService);
    expect(service).toBeTruthy();
  });
});
