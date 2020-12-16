import { TestBed } from '@angular/core/testing';

import { CatalogueSegmentationFacadeService } from './catalogue-segmentation-facade.service';

describe('CatalogueSegmentationFacadeService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CatalogueSegmentationFacadeService = TestBed.get(CatalogueSegmentationFacadeService);
    expect(service).toBeTruthy();
  });
});
