import { TestBed } from '@angular/core/testing';

import { AuthFacadeService } from './auth-facade.service';

describe('AuthFacadeService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AuthFacadeService = TestBed.get(AuthFacadeService);
    expect(service).toBeTruthy();
  });
});
