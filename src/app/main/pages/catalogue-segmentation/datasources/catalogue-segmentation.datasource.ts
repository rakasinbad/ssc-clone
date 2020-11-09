import { DataSource } from '@angular/cdk/collections';
import { IQueryParams } from 'app/shared/models/query.model';
import { Observable } from 'rxjs';
import { CatalogueSegmentation } from '../models';
import { CatalogueSegmentationFacadeService } from '../services';

export class CatalogueSegmentationDataSource implements DataSource<CatalogueSegmentation> {
    isLoading$: Observable<boolean> = this.catalogueSegmentationFacade.isLoading$;
    isRefresh$: Observable<boolean> = this.catalogueSegmentationFacade.isRefresh$;
    totalItem$: Observable<number> = this.catalogueSegmentationFacade.totalItem$;

    constructor(private catalogueSegmentationFacade: CatalogueSegmentationFacadeService) {}

    getWithQuery(params: IQueryParams): void {
        this.catalogueSegmentationFacade.getWithQuery(params);
    }

    connect(): Observable<CatalogueSegmentation[]> {
        return this.catalogueSegmentationFacade.catalogueSegmentations$;
    }

    disconnect(): void {
        this.catalogueSegmentationFacade.resetState();
    }
}
