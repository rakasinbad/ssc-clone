import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { CatalogueMssSettingsActions } from '../store/actions';
import { fromCatalogueMssSettings } from '../store/reducers';
import { CatalogueMssSettingsSelectors } from '../store/selectors';
import { CatalogueMssSettings, CatalogueMssSettingsSegmentation } from './../models';
import { IQueryParams } from 'app/shared/models/query.model';

@Injectable({ providedIn: 'root' })
export class CatalogueMssSettingsFacadeService {
  mssSettings$: Observable<CatalogueMssSettings[]> = this.store.select(
    CatalogueMssSettingsSelectors.getMssSettings
  );
  totalMssSettings$: Observable<number> = this.store.select(
    CatalogueMssSettingsSelectors.getTotalMssSettings
  );

  segmentations$: Observable<CatalogueMssSettingsSegmentation[]> = this.store.select(
    CatalogueMssSettingsSelectors.getSegmentations
  );
  totalSegmentations$: Observable<number> = this.store.select(
    CatalogueMssSettingsSelectors.getTotalSegmentations
  );

  isLoading$: Observable<boolean> = this.store.select(
    CatalogueMssSettingsSelectors.getIsLoading
  );
  
  constructor(private store: Store<fromCatalogueMssSettings.FeatureState>) {}
  
  getWithQuery(queryParams: IQueryParams): void {
    this.store.dispatch(
      CatalogueMssSettingsActions.fetchRequest({
        queryParams,
      })
    );
  }

  getSegmentationsWithQuery(queryParams: IQueryParams): void {
    this.store.dispatch(
      CatalogueMssSettingsActions.fetchSegmentationsRequest({
        queryParams,
      })
    );
  }

  upsertMssSettingsData(data: CatalogueMssSettings[]): void {
    this.store.dispatch(
      CatalogueMssSettingsActions.updateDataMssSettings({
          data
      })
  )
  }
}
