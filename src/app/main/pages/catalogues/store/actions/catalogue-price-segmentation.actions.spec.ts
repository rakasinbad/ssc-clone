import * as fromCataloguePriceSegmentation from './catalogue-price-segmentation.actions';

describe('loadCataloguePriceSegmentations', () => {
  it('should return an action', () => {
    expect(fromCataloguePriceSegmentation.loadCataloguePriceSegmentations().type).toBe('[CataloguePriceSegmentation] Load CataloguePriceSegmentations');
  });
});
