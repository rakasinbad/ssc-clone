import { TestBed } from '@angular/core/testing';

import { CatalogueSegmentationFormService } from './catalogue-segmentation-form.service';

describe('CatalogueSegmentationFormService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CatalogueSegmentationFormService = TestBed.get(CatalogueSegmentationFormService);
    expect(service).toBeTruthy();
  });
});
