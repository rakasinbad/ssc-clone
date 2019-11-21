import { TestBed } from '@angular/core/testing';

import { OrderApiService } from './order-api.service';

describe('OrderApiService', () => {
    beforeEach(() => TestBed.configureTestingModule({}));

    it('should be created', () => {
        const service: OrderApiService = TestBed.get(OrderApiService);
        expect(service).toBeTruthy();
    });
});
