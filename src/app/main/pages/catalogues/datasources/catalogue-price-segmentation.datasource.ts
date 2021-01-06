import { DataSource } from '@angular/cdk/collections';
import { IQueryParams } from 'app/shared/models/query.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { CataloguePrice } from '../models';
import { CatalogueFacadeService } from '../services';

export class CataloguePriceSegmentationDataSource implements DataSource<CataloguePrice> {
    private _collections$: BehaviorSubject<CataloguePrice[]> = new BehaviorSubject([]);

    collections: CataloguePrice[] = [];
    isLoading$: Observable<boolean> = this.catalogueFacade.isLoading$;
    totalCataloguePrice$: Observable<number> = this.catalogueFacade.totalCataloguePrice$;

    constructor(private catalogueFacade: CatalogueFacadeService) {}

    getWithQuery(params: IQueryParams): void {
        this.catalogueFacade.getWithQuery(params);
    }

    collections$(): Observable<CataloguePrice[]> {
        return this._collections$.asObservable();
    }

    connect(): Observable<CataloguePrice[]> {
        return this.catalogueFacade.cataloguePrices$.pipe(
            map((cataloguePrices) => {
                return cataloguePrices.map((item) => {
                    const newItem: CataloguePrice = {
                        ...item,
                        price:
                            typeof item.price === 'string'
                                ? ((String(item.price).replace('.', ',') as unknown) as number)
                                : item.price,
                    };

                    return new CataloguePrice(newItem);
                });
            }),
            tap((item) => this._collections$.next(item))
        );
    }

    disconnect(): void {
        this._collections$.next([]);
        this._collections$.complete();
    }
}
