import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable } from 'rxjs';

import { DeletePriceSegmentationEffects } from './delete-price-segmentation.effects';

describe('DeletePriceSegmentationEffects', () => {
  let actions$: Observable<any>;
  let effects: DeletePriceSegmentationEffects;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        DeletePriceSegmentationEffects,
        provideMockActions(() => actions$)
      ]
    });

    effects = TestBed.get<DeletePriceSegmentationEffects>(DeletePriceSegmentationEffects);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });
});
