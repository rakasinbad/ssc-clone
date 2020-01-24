import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable } from 'rxjs';

import { PortfolioEffects } from './portfolio.effects';

describe('PortfolioEffects', () => {
  let actions$: Observable<any>;
  let effects: PortfolioEffects;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PortfolioEffects,
        provideMockActions(() => actions$)
      ]
    });

    effects = TestBed.get<PortfolioEffects>(PortfolioEffects);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });
});
