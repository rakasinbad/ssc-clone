import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Action } from '@ngrx/store';
import { catchOffline } from '@ngx-pwa/offline';
import { AnyAction } from 'app/shared/models/actions.model';
import { ErrorHandler, PaginateResponse } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { CatalogueTaxResponseProps } from '../models';
import { CatalogueTaxActions, CatalogueTaxFailureActions } from '../store/actions';
import { CatalogueTax } from './../models/classes/catalogue-tax.class';
import { CatalogueTaxApiService } from './catalogue-tax-api.service';

@Injectable({ providedIn: 'root' })
export class CatalogueTaxService {
    constructor(private readonly catalogueTaxApi: CatalogueTaxApiService) {}

    fetchCatalogueTaxesRequest$(queryParams: IQueryParams): Observable<Action> {
        return this.catalogueTaxApi
            .getWithQuery<PaginateResponse<CatalogueTaxResponseProps>>(queryParams)
            .pipe(
                catchOffline(),
                map(({ data: items, total: totalItems }) => {
                    const data =
                        items && !!items.length ? items.map((item) => new CatalogueTax(item)) : [];
                    const total = typeof totalItems === 'number' ? totalItems : 0;

                    return { data, total };
                }),
                map(({ data, total }) => CatalogueTaxActions.fetchSuccess({ data, total })),
                catchError((err) => this._sendErrorToState$(err, 'fetchFailure'))
            );
    }

    private _sendErrorToState$(
        err: ErrorHandler | HttpErrorResponse | object,
        dispatchTo: CatalogueTaxFailureActions
    ): Observable<AnyAction> {
        if (err instanceof ErrorHandler) {
            return of(
                CatalogueTaxActions[dispatchTo]({
                    payload: JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err))),
                })
            );
        }

        if (err instanceof HttpErrorResponse) {
            return of(
                CatalogueTaxActions[dispatchTo]({
                    payload: {
                        id: `ERR_HTTP_${err.statusText.toUpperCase()}`,
                        errors: JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err))),
                    },
                })
            );
        }

        return of(
            CatalogueTaxActions[dispatchTo]({
                payload: {
                    id: `ERR_UNRECOGNIZED`,
                    errors: JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err))),
                },
            })
        );
    }
}
