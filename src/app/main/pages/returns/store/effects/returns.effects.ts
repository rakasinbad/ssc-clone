import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { StorageMap } from '@ngx-pwa/local-storage';
import { Store } from '@ngrx/store';
import { Actions } from '@ngrx/effects';

import { IErrorHandler } from 'app/shared/models/global.model';
import { LogService, NoticeService } from 'app/shared/helpers';

import {
    createFetchReturnDetailFailure,
    createFetchReturnDetailRequest,
    createFetchReturnFailure,
    createFetchReturnRequest,
    createFetchTotalReturnRequest
} from './factory_handlers';

import { IReturnsEffects } from './IReturnsEffects';

import {
    IReturnDetail,
    IReturnLine,
    ITotalReturnModel,
} from '../../models';

import { returnsReducer } from '../reducers';
import { ReturnApiService } from '../../service';

/**
 *
 * @export
 * @class ReturnEffects
 */
@Injectable()
export class ReturnEffects implements IReturnsEffects {
    readonly returnApiService: ReturnApiService;
    readonly store: Store<returnsReducer.FeatureState>;
    readonly actions$: Actions;
    readonly $log: LogService;
    readonly $notice: NoticeService;
    readonly storage: StorageMap;
    readonly router: Router;

    readonly fetchReturnRequest$: Observable<{ payload: {total: number, data: Array<IReturnLine>} | IErrorHandler }>;
    readonly fetchReturnFailure$: Observable<IErrorHandler>;

    readonly fetchReturnDetailRequest$: Observable<{ payload: { data: IReturnDetail } | IErrorHandler }>;
    readonly fetchReturnDetailFailure$: Observable<IErrorHandler>;

    readonly fetchTotalReturnRequest$: Observable<{ payload: ITotalReturnModel | IErrorHandler }>;
    readonly fetchTotalReturnFailure$: Observable<IErrorHandler>;

    constructor(
        store: Store<returnsReducer.FeatureState>,
        returnApiService: ReturnApiService,
        actions$: Actions,
        $log: LogService,
        $notice: NoticeService,
        storage: StorageMap,
        router: Router,
    ) {
        this.store = store;
        this.returnApiService = returnApiService;
        this.actions$ = actions$;
        this.$log = $log;
        this.$notice = $notice;
        this.storage = storage;
        this.router = router;

        this.fetchReturnRequest$ = createFetchReturnRequest(this);
        this.fetchReturnFailure$ = createFetchReturnFailure(this);

        this.fetchReturnDetailRequest$ = createFetchReturnDetailRequest(this);
        this.fetchReturnDetailFailure$ = createFetchReturnDetailFailure(this);

        this.fetchTotalReturnRequest$ = createFetchTotalReturnRequest(this);
        this.fetchTotalReturnFailure$ = createFetchReturnFailure(this);
    }
}
