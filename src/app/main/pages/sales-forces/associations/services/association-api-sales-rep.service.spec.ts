import { TestBed } from '@angular/core/testing';

import { AssociationApiSalesRepsService } from './association-api-sales-rep.service';

describe('AssociationApiSalesRepsService', () => {
    beforeEach(() => TestBed.configureTestingModule({}));

    it('should be created', () => {
        const service: AssociationApiSalesRepsService = TestBed.get(AssociationApiSalesRepsService);
        expect(service).toBeTruthy();
    });
});
