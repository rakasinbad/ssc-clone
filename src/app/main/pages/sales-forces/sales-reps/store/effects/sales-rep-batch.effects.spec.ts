import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable } from 'rxjs';

import { SalesRepBatchEffects } from './sales-rep-batch.effects';

describe('SalesRepBatchEffects', () => {
  let actions$: Observable<any>;
  let effects: SalesRepBatchEffects;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SalesRepBatchEffects,
        provideMockActions(() => actions$)
      ]
    });

    effects = TestBed.get<SalesRepBatchEffects>(SalesRepBatchEffects);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });
});
