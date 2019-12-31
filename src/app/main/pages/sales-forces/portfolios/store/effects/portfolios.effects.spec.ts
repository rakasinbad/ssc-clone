import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable } from 'rxjs';

import { PortfoliosEffects } from './portfolios.effects';

describe('PortfoliosEffects', () => {
  let actions$: Observable<any>;
  let effects: PortfoliosEffects;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PortfoliosEffects,
        provideMockActions(() => actions$)
      ]
    });

    effects = TestBed.get<PortfoliosEffects>(PortfoliosEffects);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });
});
