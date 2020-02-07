import { TestBed } from '@angular/core/testing';

import { StoreSettingApiService } from './store-setting-api.service';

describe('StoreSettingApiService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: StoreSettingApiService = TestBed.get(StoreSettingApiService);
    expect(service).toBeTruthy();
  });
});
