import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable } from 'rxjs';

import { CatalogueEffects } from './catalogue.effects';

describe('CatalogueEffects', () => {
  let actions$: Observable<any>;
  let effects: CatalogueEffects;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CatalogueEffects,
        provideMockActions(() => actions$)
      ]
    });

    effects = TestBed.get<CatalogueEffects>(CatalogueEffects);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });
});
