import { HttpClient, HttpEvent, HttpEventType, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import * as fromRoot from 'app/store/app.reducer';
import { Observable, of } from 'rxjs';

import { HelperService } from './helper.service';
import { ProgressActions } from '../store/actions';
import { Progress } from '../models';

@Injectable({
    providedIn: 'root'
})
export class DownloadApiService {
    private _url: string;
    private readonly _endpoint = '/download';

    constructor(
        private http: HttpClient,
        private store: Store<fromRoot.State>,
        private _$helper: HelperService
    ) {
        this._url = this._$helper.handleApiRouter(this._endpoint);
    }

    download(endpoint: string, supplierId?: string, filter?: any): Observable<any> {
        const newArg = supplierId
            ? [
                  {
                      key: 'supplierId',
                      value: supplierId
                  },
                  {
                      key: 'status',
                      value: filter.status
                  },
                  {
                      key: 'dateGte',
                      value: filter.dateGte
                  },
                  {
                      key: 'dateLte',
                      value: filter.dateLte
                  }
              ]
            : [
                  {
                      key: 'status',
                      value: filter.status
                  },
                  {
                      key: 'dateGte',
                      value: filter.dateGte
                  },
                  {
                      key: 'dateLte',
                      value: filter.dateLte
                  }
              ];

        const newParams = this._$helper.handleParams(this._url, null, ...newArg);

        return this.http.get(`${this._url}/${endpoint}`, {
            // reportProgress: true,
            // observe: 'events',
            params: newParams
        });
    }

    handleHttpProgress(ev: HttpEvent<any> | HttpResponse<Blob>, id: string): Observable<any> {
        switch (ev.type) {
            case HttpEventType.DownloadProgress: {
                const progress = Math.round((100 * ev.loaded) / ev.total);
                this.store.dispatch(
                    ProgressActions.downloadProgress({ payload: { id, progress } })
                );
                return of({ ...ev, progress });
            }

            case HttpEventType.ResponseHeader: {
                if (ev.status === 200) {
                    return of({ ...ev, progress: 100 });
                }

                return of({ ...ev, progress: 0 });
            }

            case HttpEventType.Response: {
                const { body, type } = ev;

                if (ev.status === 200) {
                    this.store.dispatch(
                        ProgressActions.downloadSuccess({ payload: { id, progress: 100 } })
                    );
                }

                return of({ body, type, progress: 100 });
            }

            default:
                return of({ ...ev, progress: 0 });
        }
    }
}
