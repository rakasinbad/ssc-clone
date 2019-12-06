import { TestBed } from '@angular/core/testing';

import { DownloadApiService } from './download-api.service';

describe('DownloadApiService', () => {
    beforeEach(() => TestBed.configureTestingModule({}));

    it('should be created', () => {
        const service: DownloadApiService = TestBed.get(DownloadApiService);
        expect(service).toBeTruthy();
    });
});
