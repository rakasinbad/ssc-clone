import { TestBed } from '@angular/core/testing';

import { VehicleAccessibilityApiService } from './vehicle-accessibility-api.service';

describe('VehicleAccessibilityApiService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: VehicleAccessibilityApiService = TestBed.get(VehicleAccessibilityApiService);
    expect(service).toBeTruthy();
  });
});
