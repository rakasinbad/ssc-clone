import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable } from 'rxjs';

import { CreateCatalogueSegmentationEffects } from './create-catalogue-segmentation.effects';

describe('CreateCatalogueSegmentationEffects', () => {
  let actions$: Observable<any>;
  let effects: CreateCatalogueSegmentationEffects;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CreateCatalogueSegmentationEffects,
        provideMockActions(() => actions$)
      ]
    });

    effects = TestBed.get<CreateCatalogueSegmentationEffects>(CreateCatalogueSegmentationEffects);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });
});
