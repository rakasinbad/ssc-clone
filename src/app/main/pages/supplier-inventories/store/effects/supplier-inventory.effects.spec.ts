import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable } from 'rxjs';

import { SupplierInventoryEffects } from './supplier-inventory.effects';

describe('SupplierInventoryEffects', () => {
  let actions$: Observable<any>;
  let effects: SupplierInventoryEffects;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SupplierInventoryEffects,
        provideMockActions(() => actions$)
      ]
    });

    effects = TestBed.get<SupplierInventoryEffects>(SupplierInventoryEffects);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });
});
