import { TestBed } from '@angular/core/testing';

import { AssociationApiService } from './association-api.service';

describe('AssociationApiService', () => {
    beforeEach(() => TestBed.configureTestingModule({}));

    it('should be created', () => {
        const service: AssociationApiService = TestBed.get(AssociationApiService);
        expect(service).toBeTruthy();
    });
});
