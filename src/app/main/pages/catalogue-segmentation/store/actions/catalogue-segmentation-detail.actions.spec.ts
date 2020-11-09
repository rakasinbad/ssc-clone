import * as fromCatalogueSegmentationDetail from './catalogue-segmentation-detail.actions';

describe('loadCatalogueSegmentationDetails', () => {
  it('should return an action', () => {
    expect(fromCatalogueSegmentationDetail.loadCatalogueSegmentationDetails().type).toBe('[CatalogueSegmentationDetail] Load CatalogueSegmentationDetails');
  });
});
