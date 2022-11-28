import { TestBed } from '@angular/core/testing';

import { CataloguePriceSegmentationApiService } from './catalogue-price-segmentation-api.service';

describe('CataloguePriceSegmentationApiService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CataloguePriceSegmentationApiService = TestBed.get(CataloguePriceSegmentationApiService);
    expect(service).toBeTruthy();
  });
});
