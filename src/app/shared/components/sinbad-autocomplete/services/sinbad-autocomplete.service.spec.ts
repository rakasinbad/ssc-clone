import { TestBed } from '@angular/core/testing';

import { SinbadAutocompleteService } from './sinbad-autocomplete.service';

describe('SinbadAutocompleteService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SinbadAutocompleteService = TestBed.get(SinbadAutocompleteService);
    expect(service).toBeTruthy();
  });
});
