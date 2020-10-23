import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable } from 'rxjs';

import { FetchCatalogueSegmentationsEffects } from './fetch-catalogue-segmentations.effects';

describe('FetchCatalogueSegmentationsEffects', () => {
  let actions$: Observable<any>;
  let effects: FetchCatalogueSegmentationsEffects;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        FetchCatalogueSegmentationsEffects,
        provideMockActions(() => actions$)
      ]
    });

    effects = TestBed.get<FetchCatalogueSegmentationsEffects>(FetchCatalogueSegmentationsEffects);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });
});
