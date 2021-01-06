import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HelperService } from 'app/shared/helpers';
import { Observable } from 'rxjs';
import { CataloguesModule } from '../catalogues.module';
import { AdjustCataloguePriceDto } from '../models';

@Injectable({ providedIn: CataloguesModule })
export class CataloguePriceSegmentationApiService {
    private url: string;
    private readonly endpoint: string = '/price-settings';

    constructor(private readonly http: HttpClient, private readonly helperService: HelperService) {
        this.url = this.helperService.handleApiRouter(this.endpoint);
    }

    delete<T>(id: string): Observable<T> {
        return this.http.delete<T>(`${this.url}/${id}`);
    }

    create(body: AdjustCataloguePriceDto): Observable<any> {
        return this.http.post(this.url, body);
    }
}
