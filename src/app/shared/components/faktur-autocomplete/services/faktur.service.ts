import { Injectable } from '@angular/core';
import { HelperService } from 'app/shared/helpers';
import { ErrorHandler, PaginateResponse } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { FakturAutocomplete, FakturResponse } from '../models';
import { FakturAutocompleteModule } from '../faktur-autocomplete.module';
import { FakturApiService } from './faktur-api.service';

@Injectable({ providedIn: FakturAutocompleteModule })
export class FakturService {
    private _collections$: BehaviorSubject<FakturAutocomplete[]> = new BehaviorSubject([]);
    private _loading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
    private _totalCollections$: BehaviorSubject<number> = new BehaviorSubject(0);
    private _total$: BehaviorSubject<number> = new BehaviorSubject(0);
    // private _collections: FakturAutocomplete[] = [];

    readonly collections$: Observable<
        FakturAutocomplete[]
    > = this._collections$.asObservable();
    readonly loading$: Observable<boolean> = this._loading$.asObservable();
    readonly totalCollections$: Observable<number> = this._totalCollections$.asObservable();
    readonly total$: Observable<number> = this._total$.asObservable();

    constructor(
        private FakturApiService: FakturApiService,
        private helperService: HelperService
    ) {}

    getWithQuery(params: IQueryParams): void {
        this._loading$.next(true);

        this.FakturApiService
            .getWithQuery<PaginateResponse<FakturResponse>>(params)
            .pipe(
                map((resp) => {
                    const newResp = {
                        data:
                            resp && resp.data && resp.data.length > 0
                                ? resp.data.map(
                                      (item) =>
                                          new FakturAutocomplete({
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
                tap((resp) => HelperService.debug('[FakturService] getWithQuery', { resp }))
            )
            .subscribe({
                next: ({ data, total }) => {
                    this._collections$.next(data);
                    this._totalCollections$.next(data.length);

                    this._total$.next(total);
                    this._loading$.next(false);
                },
                complete: () => HelperService.debug('[FakturService] getWithQuery complete'),
                error: (err) => {
                    this._loading$.next(false);
                    HelperService.debug('[FakturService] getWithQuery error', { err });
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

    /* private _setCollections(value: FakturAutocomplete[]): void {
        if (Array.isArray(value) && value.length) {
            if (this._collections.length) {
                this._collections = this._collections.map((item) => {
                    const addItem = value.find((newItem) => newItem.id === item.id);

                    if (addItem) {
                        item = { ...item, ...addItem };
                    }

                    HelperService.debug('[FakturService] _setCollections', { item });

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
