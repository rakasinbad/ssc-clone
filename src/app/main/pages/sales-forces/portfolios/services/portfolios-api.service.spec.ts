import { TestBed } from '@angular/core/testing';

import { PortfoliosApiService } from './portfolios-api.service';

describe('PortfoliosApiService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PortfoliosApiService = TestBed.get(PortfoliosApiService);
    expect(service).toBeTruthy();
  });
});
