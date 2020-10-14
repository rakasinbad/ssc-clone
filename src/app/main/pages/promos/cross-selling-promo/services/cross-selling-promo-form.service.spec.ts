import { TestBed } from '@angular/core/testing';

import { CrossSellingPromoFormService } from './cross-selling-promo-form.service';

describe('CrossSellingPromoFormService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CrossSellingPromoFormService = TestBed.get(CrossSellingPromoFormService);
    expect(service).toBeTruthy();
  });
});
