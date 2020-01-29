import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable } from 'rxjs';

import { StoreSettingEffects } from './store-setting.effects';

describe('StoreSettingEffects', () => {
  let actions$: Observable<any>;
  let effects: StoreSettingEffects;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        StoreSettingEffects,
        provideMockActions(() => actions$)
      ]
    });

    effects = TestBed.get<StoreSettingEffects>(StoreSettingEffects);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });
});
