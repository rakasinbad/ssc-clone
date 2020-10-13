import { TestBed } from '@angular/core/testing';

import { OrderFacadeService } from './order-facade.service';

describe('OrderFacadeService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: OrderFacadeService = TestBed.get(OrderFacadeService);
    expect(service).toBeTruthy();
  });
});
