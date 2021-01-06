import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable } from 'rxjs';

import { FetchCatalogueSegmentationEffects } from './fetch-catalogue-segmentation.effects';

describe('FetchCatalogueSegmentationEffects', () => {
  let actions$: Observable<any>;
  let effects: FetchCatalogueSegmentationEffects;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        FetchCatalogueSegmentationEffects,
        provideMockActions(() => actions$)
      ]
    });

    effects = TestBed.get<FetchCatalogueSegmentationEffects>(FetchCatalogueSegmentationEffects);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });
});
