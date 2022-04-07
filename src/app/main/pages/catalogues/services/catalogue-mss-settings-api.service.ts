import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HelperService } from 'app/shared/helpers';
import { IQueryParams } from 'app/shared/models/query.model';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CatalogueMssSettingsApiService {
    private url: string;
    private readonly segmentationEndpoint: string = '/segmentations';
    private readonly mssTypeEndpoint: string = '/mss-types';

    constructor(private readonly http: HttpClient, private readonly helperService: HelperService) {}

    getSegmentationsWithQuery<T>(queryParams: IQueryParams): Observable<T> {
        this.url = this.helperService.handleApiRouter(this.segmentationEndpoint);
        /** temporary mock url */
        this.url = `https://dc687b55-e036-4881-bd9d-e293f9177433.mock.pstmn.io/segmentations`;
        const params = this.helperService.handleParams(this.url, queryParams);

        return this.http.get<T>(this.url, { params });
    }

    getMssTypes<T>(): Observable<T> {
        this.url = this.helperService.handleApiRouter(this.mssTypeEndpoint);
        return this.http.get<T>(this.url);
    }
}
