import { TestBed } from '@angular/core/testing';

import { CrossSellingPromoFacadeService } from './cross-selling-promo-facade.service';

describe('CrossSellingPromoFacadeService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CrossSellingPromoFacadeService = TestBed.get(CrossSellingPromoFacadeService);
    expect(service).toBeTruthy();
  });
});
