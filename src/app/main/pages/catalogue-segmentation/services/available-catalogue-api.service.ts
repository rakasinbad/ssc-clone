import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HelperService } from 'app/shared/helpers';
import { IQueryParams } from 'app/shared/models/query.model';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AvailableCatalogueApiService {
    private url: string;
    private readonly endpoint: string = '/sku-segmentation';

    constructor(private readonly http: HttpClient, private readonly helperService: HelperService) {
        this.url = this.helperService.handleApiRouter(this.endpoint);
    }

    getById<T>(id: string, params?: IQueryParams): Observable<T> {
        let newParams: HttpParams = null;

        if (params) {
            const newArg = [
                {
                    key: 'segmentedId',
                    value: id,
                },
            ];

            if (params['supplierId']) {
                newArg.push({
                    key: 'supplierId',
                    value: params['supplierId'],
                });
            }

            if (params['keyword']) {
                newArg.push({
                    key: 'keyword',
                    value: params['keyword'],
                });
            }

            newParams = this.helperService.handleParams(this.url, params, ...newArg);
        }

        return this.http.get<T>(`${this.url}`, { params: newParams });
    }

    getWithQuery<T>(params: IQueryParams): Observable<T> {
        const newArg = [];

        if (params['supplierId']) {
            newArg.push({
                key: 'supplierId',
                value: params['supplierId'],
            });
        }

        if (params['keyword']) {
            newArg.push({
                key: 'keyword',
                value: params['keyword'],
            });
        }

        const newParams = this.helperService.handleParams(this.url, params, ...newArg);

        return this.http.get<T>(this.url, { params: newParams });
    }
}
