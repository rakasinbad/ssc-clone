import { TestBed } from '@angular/core/testing';

import { AssociationStoreApiService } from './association-store-api.service';

describe('AssociationStoreApiService', () => {
    beforeEach(() => TestBed.configureTestingModule({}));

    it('should be created', () => {
        const service: AssociationStoreApiService = TestBed.get(AssociationStoreApiService);
        expect(service).toBeTruthy();
    });
});
