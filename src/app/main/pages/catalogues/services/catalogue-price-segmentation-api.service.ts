import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HelperService } from 'app/shared/helpers';
import { Observable } from 'rxjs';
import { CataloguesModule } from '../catalogues.module';

@Injectable({ providedIn: CataloguesModule })
export class CataloguePriceSegmentationApiService {
    private url: string;
    private readonly endpoint: string = '/price-settings';

    constructor(private http: HttpClient, private helperService: HelperService) {
        this.url = this.helperService.handleApiRouter(this.endpoint);
    }

    delete<T>(id: string): Observable<T> {
        return this.http.delete<T>(`${this.url}/${id}`);
    }
}
