import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable } from 'rxjs';

import { AdjustPriceSettingEffects } from './adjust-price-setting.effects';

describe('AdjustPriceSettingEffects', () => {
  let actions$: Observable<any>;
  let effects: AdjustPriceSettingEffects;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AdjustPriceSettingEffects,
        provideMockActions(() => actions$)
      ]
    });

    effects = TestBed.get<AdjustPriceSettingEffects>(AdjustPriceSettingEffects);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });
});
