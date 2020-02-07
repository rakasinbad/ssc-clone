import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable } from 'rxjs';

import { ExportsEffects } from './exports.effects';

describe('ExportsEffects', () => {
  let actions$: Observable<any>;
  let effects: ExportsEffects;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ExportsEffects,
        provideMockActions(() => actions$)
      ]
    });

    effects = TestBed.get<ExportsEffects>(ExportsEffects);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });
});
