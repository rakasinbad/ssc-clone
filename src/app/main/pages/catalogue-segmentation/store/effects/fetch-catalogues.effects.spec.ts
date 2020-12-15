import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable } from 'rxjs';

import { FetchCataloguesEffects } from './fetch-catalogues.effects';

describe('FetchCataloguesEffects', () => {
  let actions$: Observable<any>;
  let effects: FetchCataloguesEffects;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        FetchCataloguesEffects,
        provideMockActions(() => actions$)
      ]
    });

    effects = TestBed.get<FetchCataloguesEffects>(FetchCataloguesEffects);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });
});
