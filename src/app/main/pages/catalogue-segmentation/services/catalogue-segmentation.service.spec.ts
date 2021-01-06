import { TestBed } from '@angular/core/testing';

import { CatalogueSegmentationService } from './catalogue-segmentation.service';

describe('CatalogueSegmentationService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CatalogueSegmentationService = TestBed.get(CatalogueSegmentationService);
    expect(service).toBeTruthy();
  });
});
