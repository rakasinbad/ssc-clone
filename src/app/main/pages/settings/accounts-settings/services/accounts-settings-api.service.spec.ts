import { TestBed } from '@angular/core/testing';

import { AccountsSettingsApiService } from './accounts-settings-api.service';

describe('AccountsSettingsApiService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AccountsSettingsApiService = TestBed.get(AccountsSettingsApiService);
    expect(service).toBeTruthy();
  });
});
