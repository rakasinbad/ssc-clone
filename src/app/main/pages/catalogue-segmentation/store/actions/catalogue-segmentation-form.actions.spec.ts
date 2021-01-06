import * as fromCatalogueSegmentationForm from './catalogue-segmentation-form.actions';

describe('loadCatalogueSegmentationForms', () => {
  it('should return an action', () => {
    expect(fromCatalogueSegmentationForm.loadCatalogueSegmentationForms().type).toBe('[CatalogueSegmentationForm] Load CatalogueSegmentationForms');
  });
});
