import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable } from 'rxjs';

import { StoresEffects } from './stores.effects';

describe('StoresEffects', () => {
  let actions$: Observable<any>;
  let effects: StoresEffects;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        StoresEffects,
        provideMockActions(() => actions$)
      ]
    });

    effects = TestBed.get<StoresEffects>(StoresEffects);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });
});
