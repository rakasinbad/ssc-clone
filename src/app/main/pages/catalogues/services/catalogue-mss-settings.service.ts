import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Action } from '@ngrx/store';
import { catchOffline } from '@ngx-pwa/offline';
import { AnyAction } from 'app/shared/models/actions.model';
import { ErrorHandler, PaginateResponse } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { CatalogueMssSettings, CatalogueMssSettingsSegmentation, UpsertMssSettings, ResponseUpsertMssSettings, MssBaseSupplier } from '../models';
import { CatalogueMssSettingsActions, CatalogueMssSettingsFailureActions } from '../store/actions';
import { CatalogueMssSettingsApiService } from './catalogue-mss-settings-api.service';

@Injectable({ providedIn: 'root' })
export class CatalogueMssSettingsService {
    constructor(private readonly catalogueMssSettingsApi: CatalogueMssSettingsApiService) {}

    fetchCatalogueMssSettingsRequest$(queryParams: IQueryParams): Observable<Action> {
        return this.catalogueMssSettingsApi
            .getWithQuery<PaginateResponse<CatalogueMssSettings>>(queryParams)
            .pipe(
                catchOffline(),
                map(({ data: items, total: totalItems }) => {
                    const data =
                        items && !!items.length ? items.map((item) => new CatalogueMssSettings(item)) : [];
                    const total = (totalItems && typeof totalItems === 'number') ? totalItems : 0 || data.length;
        
                    return { data, total };
                }),
                map(({ data, total }) => CatalogueMssSettingsActions.fetchSuccess({ data, total })),
                catchError((err) => this._sendErrorToState$(err, 'fetchFailure'))
            );
    }

    upsertCatalogueMssSettingsRequest$(body: Partial<UpsertMssSettings>): Observable<Action> {
        return this.catalogueMssSettingsApi
            .upsertMssSettings<ResponseUpsertMssSettings>(body)
            .pipe(
                catchOffline(),
                map((data) => CatalogueMssSettingsActions.upsertSuccess({ data })),
                catchError((err) => this._sendErrorToState$(err, 'upsertFailure'))
            );
    }
    
    fetchCatalogueMssSettingsSegmentationRequest$(queryParams: IQueryParams): Observable<Action> {
        return this.catalogueMssSettingsApi
            .getSegmentationsWithQuery<PaginateResponse<CatalogueMssSettingsSegmentation>>(queryParams)
            .pipe(
                catchOffline(),
                map(({ data: items, total: totalItems }) => {
                    const data =
                        items && !!items.length ? items.map((item) => new CatalogueMssSettingsSegmentation(item)) : [];
                    const total = (totalItems && typeof totalItems === 'number') ? totalItems : 0 || data.length;
        
                    return { data, total };
                }),
                map(({ data, total }) => CatalogueMssSettingsActions.fetchSegmentationsSuccess({ data, total })),
                catchError((err) => this._sendErrorToState$(err, 'fetchSegmentationsFailure'))
            );
    }


    fetchMssBaseRequest$(supplierId: string, queryParams: IQueryParams): Observable<Action> {
        return this.catalogueMssSettingsApi
            .getMssBase<MssBaseSupplier>(supplierId)
            .pipe(
                catchOffline(),
                map((data) => {
                    return CatalogueMssSettingsActions.fetchMssBaseSuccess({ data });
                }),
                catchError((err) => this._sendErrorToState$(err, 'fetchMssBaseFailure'))
            );
    }


    private _sendErrorToState$(
        err: ErrorHandler | HttpErrorResponse | object,
        dispatchTo: CatalogueMssSettingsFailureActions
    ): Observable<AnyAction> {
        if (err instanceof ErrorHandler) {
            return of(
                CatalogueMssSettingsActions[dispatchTo]({
                    payload: JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err))),
                })
            );
        }

        if (err instanceof HttpErrorResponse) {
            return of(
                CatalogueMssSettingsActions[dispatchTo]({
                    payload: {
                        id: `ERR_HTTP_${err.statusText.toUpperCase()}`,
                        errors: JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err))),
                    },
                })
            );
        }

        return of(
            CatalogueMssSettingsActions[dispatchTo]({
                payload: {
                    id: `ERR_UNRECOGNIZED`,
                    errors: JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err))),
                },
            })
        );
    }
}
