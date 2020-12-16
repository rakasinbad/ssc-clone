import * as fromCatalogue from './catalogue.actions';

describe('loadCatalogues', () => {
  it('should return an action', () => {
    expect(fromCatalogue.loadCatalogues().type).toBe('[Catalogue] Load Catalogues');
  });
});
