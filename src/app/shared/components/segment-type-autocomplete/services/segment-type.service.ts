import { Injectable } from '@angular/core';
import { HelperService } from 'app/shared/helpers';
import { ErrorHandler, PaginateResponse } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { SegmentTypeAutocomplete, SegmentTypeResponse } from '../models';
import { SegmentTypeAutocompleteModule } from '../segment-type-autocomplete.module';
import { SegmentTypeApiService } from './segment-type-api.service';

@Injectable({ providedIn: SegmentTypeAutocompleteModule })
export class SegmentTypeService {
    private _collections$: BehaviorSubject<SegmentTypeAutocomplete[]> = new BehaviorSubject([]);
    private _loading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
    private _totalCollections$: BehaviorSubject<number> = new BehaviorSubject(0);
    private _total$: BehaviorSubject<number> = new BehaviorSubject(0);
    // private _collections: SegmentTypeAutocomplete[] = [];

    readonly collections$: Observable<
        SegmentTypeAutocomplete[]
    > = this._collections$.asObservable();
    readonly loading$: Observable<boolean> = this._loading$.asObservable();
    readonly totalCollections$: Observable<number> = this._totalCollections$.asObservable();
    readonly total$: Observable<number> = this._total$.asObservable();

    constructor(
        private segmentTypeApiService: SegmentTypeApiService,
        private helperService: HelperService
    ) {}

    getWithQuery(params: IQueryParams): void {
        this._loading$.next(true);

        this.segmentTypeApiService
            .getWithQuery<PaginateResponse<SegmentTypeResponse>>(params)
            .pipe(
                map((resp) => {
                    const newResp = {
                        data:
                            resp && resp.data && resp.data.length > 0
                                ? resp.data.map(
                                      (item) =>
                                          new SegmentTypeAutocomplete({
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
                tap((resp) => HelperService.debug('[SegmentTypeService] getWithQuery', { resp }))
            )
            .subscribe({
                next: ({ data, total }) => {
                    this._collections$.next(data);
                    this._totalCollections$.next(data.length);

                    this._total$.next(total);
                    this._loading$.next(false);
                },
                complete: () => HelperService.debug('[SegmentTypeService] getWithQuery complete'),
                error: (err) => {
                    this._loading$.next(false);
                    HelperService.debug('[SegmentTypeService] getWithQuery error', { err });
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

    /* private _setCollections(value: SegmentTypeAutocomplete[]): void {
        if (Array.isArray(value) && value.length) {
            if (this._collections.length) {
                this._collections = this._collections.map((item) => {
                    const addItem = value.find((newItem) => newItem.id === item.id);

                    if (addItem) {
                        item = { ...item, ...addItem };
                    }

                    HelperService.debug('[SegmentTypeService] _setCollections', { item });

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
