import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HelperService } from 'app/shared/helpers';
import { IQueryParams } from 'app/shared/models/query.model';
import { UpsertMssSettings } from '../models';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CatalogueMssSettingsApiService {
    private url: string;
    private readonly endpoint: string = '/mss-settings';
    private readonly segmentationEndpoint: string = '/mss-segmentation-recomendations';
    private readonly mssTypeEndpoint: string = '/mss-types';
    private readonly mssBaseEndpoint: string = '/mss-base-supplier';
    private readonly mssBaseListEndpoint: string = '/mss-bases';

    constructor(private readonly http: HttpClient, private readonly helperService: HelperService) {}

    getWithQuery<T>(queryParams: IQueryParams): Observable<T> {
        this.url = this.helperService.handleApiRouter(this.endpoint); 
        const params = this.helperService.handleParams(this.url, queryParams);
        
        return this.http.get<T>(this.url, { params });
    }

    upsertMssSettings<T>(body: Partial<UpsertMssSettings>): Observable<T> {
        this.url = this.helperService.handleApiRouter(this.endpoint); 
        
        return this.http.post<T>(this.url, body);
    }

    getSegmentationsWithQuery<T>(queryParams: IQueryParams): Observable<T> {
        this.url = this.helperService.handleApiRouter(this.segmentationEndpoint);
        const params = this.helperService.handleParams(this.url, queryParams);

        return this.http.get<T>(this.url, { params });
    }

    getMssTypes<T>(): Observable<T> {
        this.url = this.helperService.handleApiRouter(this.mssTypeEndpoint);
        return this.http.get<T>(this.url);
    }

    getMssBase<T>(supplierId: string): Observable<T> {
        this.url = this.helperService.handleApiRouter(`${this.mssBaseEndpoint}/${supplierId}`);
        return this.http.get<T>(this.url);
    }

    getMssBaseList<T>(): Observable<T> {
        this.url = this.helperService.handleApiRouter(`${this.mssBaseListEndpoint}`);
        return this.http.get<T>(this.url);
    }
}
