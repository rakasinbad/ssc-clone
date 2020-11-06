import { TestBed } from '@angular/core/testing';

import { CatalogueFacadeService } from './catalogue-facade.service';

describe('CatalogueFacadeService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CatalogueFacadeService = TestBed.get(CatalogueFacadeService);
    expect(service).toBeTruthy();
  });
});
