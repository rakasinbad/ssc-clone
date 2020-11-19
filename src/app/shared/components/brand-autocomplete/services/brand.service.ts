import { Injectable } from '@angular/core';
import { HelperService } from 'app/shared/helpers';
import { ErrorHandler, PaginateResponse } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { BrandAutocomplete, BrandResponse } from '../models';
import { BrandAutocompleteModule } from '../brand-autocomplete.module';
import { BrandApiService } from './brand-api.service';

@Injectable({ providedIn: BrandAutocompleteModule })
export class BrandService {
    private _collections$: BehaviorSubject<BrandAutocomplete[]> = new BehaviorSubject([]);
    private _loading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
    private _totalCollections$: BehaviorSubject<number> = new BehaviorSubject(0);
    private _total$: BehaviorSubject<number> = new BehaviorSubject(0);
    // private _collections: BrandAutocomplete[] = [];

    readonly collections$: Observable<
        BrandAutocomplete[]
    > = this._collections$.asObservable();
    readonly loading$: Observable<boolean> = this._loading$.asObservable();
    readonly totalCollections$: Observable<number> = this._totalCollections$.asObservable();
    readonly total$: Observable<number> = this._total$.asObservable();

    constructor(
        private BrandApiService: BrandApiService,
        private helperService: HelperService
    ) {}

    getWithQuery(params: IQueryParams): void {
        this._loading$.next(true);

        this.BrandApiService
            .getWithQuery<PaginateResponse<BrandResponse>>(params)
            .pipe(
                map((resp) => {
                    const newResp = {
                        data:
                            resp && resp.data && resp.data.length > 0
                                ? resp.data.map(
                                      (item) =>
                                          new BrandAutocomplete({
                                              id: item.id,
                                              label: item.name,
                                              originalSource: item,
                                          })
                                  )
                                : [],
                        total: resp.total,
                    };

                    return newResp;
                }),
                tap((resp) => HelperService.debug('[BrandService] getWithQuery', { resp }))
            )
            .subscribe({
                next: ({ data, total }) => {
                    this._collections$.next(data);
                    this._totalCollections$.next(data.length);

                    this._total$.next(total);
                    this._loading$.next(false);
                },
                complete: () => HelperService.debug('[BrandService] getWithQuery complete'),
                error: (err) => {
                    this._loading$.next(false);
                    HelperService.debug('[BrandService] getWithQuery error', { err });
                    this.helperService.showErrorNotification(
                        new ErrorHandler({ id: err.code, errors: err })
                    );
                },
            });
    }

    reset(): void {
        this._collections$.next([]);
        this._totalCollections$.next(0);
        this._total$.next(0);
        this._loading$.next(false);
    }

    /* private _setCollections(value: BrandAutocomplete[]): void {
        if (Array.isArray(value) && value.length) {
            if (this._collections.length) {
                this._collections = this._collections.map((item) => {
                    const addItem = value.find((newItem) => newItem.id === item.id);

                    if (addItem) {
                        item = { ...item, ...addItem };
                    }

                    HelperService.debug('[BrandService] _setCollections', { item });

                    return item;
                });
            } else {
                this._collections.push(...value);
            }
        } else {
            this._collections = [];
        }

        this._collections$.next(this._collections);
        this._totalCollections$.next(this._collections.length);
    } */
}
