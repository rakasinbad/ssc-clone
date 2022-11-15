import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable } from 'rxjs';

import { InternalEffects } from './internal.effects';

describe('InternalEffects', () => {
  let actions$: Observable<any>;
  let effects: InternalEffects;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        InternalEffects,
        provideMockActions(() => actions$)
      ]
    });

    effects = TestBed.get<InternalEffects>(InternalEffects);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });
});
