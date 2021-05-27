import { DataSource } from '@angular/cdk/collections';
import { FormMode } from 'app/shared/models';
import { IQueryParams } from 'app/shared/models/query.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AvailableCatalogue } from '../models';
import { AvailableCatalogueFacadeService } from '../services';

export class AvailableCatalogueDataSource implements DataSource<AvailableCatalogue> {
    private _collections$: BehaviorSubject<AvailableCatalogue[]> = new BehaviorSubject([]);

    collections: AvailableCatalogue[] = [];
    isLoading$: Observable<boolean> = this.availableCatalogueFacade.isLoading$;
    isRefresh$: Observable<boolean> = this.availableCatalogueFacade.isRefresh$;
    totalItem$: Observable<number> = this.availableCatalogueFacade.totalItem$;

    constructor(private availableCatalogueFacade: AvailableCatalogueFacadeService) {}

    getWithQuery(params: IQueryParams, formMode: FormMode = 'add', id?: string): void {
        this.availableCatalogueFacade.getWithQuery(params, formMode, id);
    }

    collections$(): Observable<AvailableCatalogue[]> {
        return this._collections$.asObservable();
    }

    connect(): Observable<AvailableCatalogue[]> {
        return this.availableCatalogueFacade.catalogues$.pipe(
            tap((item) => this._collections$.next(item))
        );
    }

    disconnect(): void {
        this._collections$.next([]);
        this._collections$.complete();

        this.availableCatalogueFacade.resetState();
    }
}
