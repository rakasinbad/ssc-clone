import * as fromCatalogueSegmentation from './catalogue-segmentation.actions';

describe('loadCatalogueSegmentations', () => {
  it('should return an action', () => {
    expect(fromCatalogueSegmentation.loadCatalogueSegmentations().type).toBe('[CatalogueSegmentation] Load CatalogueSegmentations');
  });
});
