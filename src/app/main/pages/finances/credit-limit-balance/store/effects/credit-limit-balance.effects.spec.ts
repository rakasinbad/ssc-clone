import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable } from 'rxjs';

import { CreditLimitBalanceEffects } from './credit-limit-balance.effects';

describe('CreditLimitBalanceEffects', () => {
  let actions$: Observable<any>;
  let effects: CreditLimitBalanceEffects;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CreditLimitBalanceEffects,
        provideMockActions(() => actions$)
      ]
    });

    effects = TestBed.get<CreditLimitBalanceEffects>(CreditLimitBalanceEffects);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });
});
