import * as fromCatalogueDetailPage from './catalogue-detail-page.actions';

describe('loadCatalogueDetailPages', () => {
  it('should return an action', () => {
    expect(fromCatalogueDetailPage.loadCatalogueDetailPages().type).toBe('[CatalogueDetailPage] Load CatalogueDetailPages');
  });
});
