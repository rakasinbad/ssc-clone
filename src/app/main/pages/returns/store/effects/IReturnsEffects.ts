import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Actions } from '@ngrx/effects';
import { StorageMap } from '@ngx-pwa/local-storage';
import { LogService, NoticeService } from 'app/shared/helpers';
import { returnsReducer } from '../reducers';
import { ReturnApiService } from '../../service';

export interface IReturnsEffects {
    readonly returnApiService: ReturnApiService;
    readonly store: Store<returnsReducer.FeatureState>;
    readonly actions$: Actions;
    readonly $log: LogService;
    readonly $notice: NoticeService;
    readonly storage: StorageMap;
    readonly router: Router;
}
