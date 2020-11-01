import { TestBed } from '@angular/core/testing';

import { CatalogueSegmentationApiService } from './catalogue-segmentation-api.service';

describe('CatalogueSegmentationApiService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CatalogueSegmentationApiService = TestBed.get(CatalogueSegmentationApiService);
    expect(service).toBeTruthy();
  });
});
