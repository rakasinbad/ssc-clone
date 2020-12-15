import { DataSource } from '@angular/cdk/collections';
import { FormMode } from 'app/shared/models';
import { IQueryParams } from 'app/shared/models/query.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Catalogue } from '../models';
import { CatalogueFacadeService } from '../services';

export class CatalogueDataSource implements DataSource<Catalogue> {
    private _collections$: BehaviorSubject<Catalogue[]> = new BehaviorSubject([]);

    collections: Catalogue[] = [];
    isLoading$: Observable<boolean> = this.catalogueFacade.isLoading$;
    isRefresh$: Observable<boolean> = this.catalogueFacade.isRefresh$;
    totalItem$: Observable<number> = this.catalogueFacade.totalItem$;

    constructor(private catalogueFacade: CatalogueFacadeService) {}

    getWithQuery(params: IQueryParams, formMode: FormMode = 'add', id?: string): void {
        this.catalogueFacade.getWithQuery(params, formMode, id);
    }

    collections$(): Observable<Catalogue[]> {
        return this._collections$.asObservable();
    }

    connect(): Observable<Catalogue[]> {
        return this.catalogueFacade.catalogues$.pipe(tap((item) => this._collections$.next(item)));
    }

    disconnect(): void {
        this._collections$.next([]);
        this._collections$.complete();

        this.catalogueFacade.resetState();
    }
}
