import { TestBed } from '@angular/core/testing';

import { UploadApiService } from './upload-api.service';

describe('UploadApiService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: UploadApiService = TestBed.get(UploadApiService);
    expect(service).toBeTruthy();
  });
});
