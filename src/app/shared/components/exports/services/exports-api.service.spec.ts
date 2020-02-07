import { TestBed } from '@angular/core/testing';

import { ExportsApiService } from './exports-api.service';

describe('ExportsApiService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ExportsApiService = TestBed.get(ExportsApiService);
    expect(service).toBeTruthy();
  });
});
