import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HelperService } from 'app/shared/helpers';
import { IQueryParams } from 'app/shared/models/query.model';
import { Observable } from 'rxjs';
import { CatalogueSegmentationModule } from '../catalogue-segmentation.module';

@Injectable({ providedIn: CatalogueSegmentationModule })
export class CatalogueApiService {
    private url: string;
    private readonly endpoint: string = '/catalogues';

    constructor(private http: HttpClient, private helperService: HelperService) {
        this.url = this.helperService.handleApiRouter(this.endpoint);
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
