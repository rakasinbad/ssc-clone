import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable } from 'rxjs';

import { UnassignedCatalogueEffects } from './unassigned-catalogue.effects';

describe('UnassignedCatalogueEffects', () => {
  let actions$: Observable<any>;
  let effects: UnassignedCatalogueEffects;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        UnassignedCatalogueEffects,
        provideMockActions(() => actions$)
      ]
    });

    effects = TestBed.get<UnassignedCatalogueEffects>(UnassignedCatalogueEffects);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });
});
