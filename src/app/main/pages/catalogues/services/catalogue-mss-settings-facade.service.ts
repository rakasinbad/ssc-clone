import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { CatalogueMssSettingsActions } from '../store/actions';
import { fromCatalogueMssSettings } from '../store/reducers';
import { CatalogueMssSettingsSelectors } from '../store/selectors';
import { CatalogueMssSettingsSegmentation } from './../models';
import { IQueryParams } from 'app/shared/models/query.model';

@Injectable({ providedIn: 'root' })
export class CatalogueMssSettingsFacadeService {
  segmentations$: Observable<CatalogueMssSettingsSegmentation[]> = this.store.select(
    CatalogueMssSettingsSelectors.getSegmentations
  );

  totalSegmentations$: Observable<number> = this.store.select(
    CatalogueMssSettingsSelectors.getTotalSegmentations
  );
  
  constructor(private store: Store<fromCatalogueMssSettings.FeatureState>) {}
  
  getWithQuery(queryParams: IQueryParams): void {
    this.store.dispatch(
      CatalogueMssSettingsActions.fetchSegmentationsRequest({
            queryParams,
        })
    );
}
}
