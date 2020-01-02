import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable } from 'rxjs';

import { SalesRepEffects } from './sales-rep.effects';

describe('SalesRepEffects', () => {
  let actions$: Observable<any>;
  let effects: SalesRepEffects;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SalesRepEffects,
        provideMockActions(() => actions$)
      ]
    });

    effects = TestBed.get<SalesRepEffects>(SalesRepEffects);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });
});
