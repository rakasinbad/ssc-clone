import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HelperService } from 'app/shared/helpers';
import { IQueryParams } from 'app/shared/models/query.model';
import { Observable } from 'rxjs';
import { CatalogueSegmentationModule } from '../catalogue-segmentation.module';

@Injectable({ providedIn: CatalogueSegmentationModule })
export class CatalogueSegmentationApiService {
    private url: string;
    private readonly endpoint: string = '/catalogue-segmentations';

    constructor(private http: HttpClient, private helperService: HelperService) {
        this.url = this.helperService.handleApiRouter(this.endpoint);
    }

    getById<T>(
        id: string,
        type: 'segmentation' | 'catalogue' = 'segmentation',
        params?: IQueryParams
    ): Observable<T> {
        let newParams: HttpParams = null;

        if (params) {
            const newArg = [
                {
                    key: 'type',
                    value: type,
                },
            ];

            if (params['keyword']) {
                newArg.push({
                    key: 'keyword',
                    value: params['keyword'],
                });
            }

            newParams = this.helperService.handleParams(this.url, params, ...newArg);
        }

        return this.http.get<T>(`${this.url}/${id}`, { params: newParams });
    }

    getWithQuery<T>(
        params: IQueryParams,
        type: 'segmentation' | 'catalogue' = 'segmentation'
    ): Observable<T> {
        const newArg = [
            {
                key: 'type',
                value: type,
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

        const newParams = this.helperService.handleParams(this.url, params, ...newArg);

        return this.http.get<T>(this.url, { params: newParams });
    }

    public deleteWithQuery(id: string): any {
        return this.http.delete(this.url + '/' + id);
    }

    patch<T, D>(body: D, id: string): Observable<T> {
        return this.http.patch<T>(`${this.url}/${id}`, body);
    }

    patchInfo<T, D>(body: D, id: string, type: 'segmentation' = 'segmentation'): Observable<T> {
        const newArg = [
            {
                key: 'type',
                value: type,
            },
        ];

        const newParams = this.helperService.handleParams(this.url, null, ...newArg);

        return this.http.patch<T>(`${this.url}/${id}`, body, { params: newParams });
    }

    post<T, D>(body: D): Observable<T> {
        return this.http.post<T>(this.url, body);
    }
}
