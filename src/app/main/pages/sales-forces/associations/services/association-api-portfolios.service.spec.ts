import { TestBed } from '@angular/core/testing';

import { AssociationApiPortfoliosService } from './association-api-portfolios.service';

describe('AssociationApiPortfoliosService', () => {
    beforeEach(() => TestBed.configureTestingModule({}));

    it('should be created', () => {
        const service: AssociationApiPortfoliosService = TestBed.get(
            AssociationApiPortfoliosService
        );
        expect(service).toBeTruthy();
    });
});
