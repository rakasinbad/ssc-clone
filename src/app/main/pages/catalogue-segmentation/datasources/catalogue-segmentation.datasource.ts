import { DataSource } from '@angular/cdk/collections';
import { IQueryParams } from 'app/shared/models/query.model';
import { Observable } from 'rxjs';
import { CatalogueSegmentationFacadeService } from '../services';

export class CatalogueSegmentationDataSource implements DataSource<any> {
    isLoading$: Observable<boolean> = this.catalogueSegmentationFacade.isLoading$;
    isRefresh$: Observable<boolean> = this.catalogueSegmentationFacade.isRefresh$;
    totalItem$: Observable<number> = this.catalogueSegmentationFacade.totalItem$;

    constructor(private catalogueSegmentationFacade: CatalogueSegmentationFacadeService) {}

    getWithQuery(params: IQueryParams): void {
        this.catalogueSegmentationFacade.getWithQuery(params);
    }

    connect(): Observable<any> {
        return this.catalogueSegmentationFacade.catalogueSegmentations$;
    }

    disconnect(): void {}
}
