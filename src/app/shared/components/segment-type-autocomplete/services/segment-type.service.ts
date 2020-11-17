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
    private _totalCollections$: BehaviorSubject<number> = new BehaviorSubject(0);
    private _total$: BehaviorSubject<number> = new BehaviorSubject(0);

    collections$: Observable<SegmentTypeAutocomplete[]> = this._collections$.asObservable();

    constructor(
        private segmentTypeApiService: SegmentTypeApiService,
        private helperService: HelperService
    ) {}

    getWithQuery(params: IQueryParams): void {
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
                },
                error: (err) => {
                    // throw new Error(err);
                    HelperService.debug('[SegmentTypeService] getWithQuery error', { err });
                    this.helperService.showErrorNotification(
                        new ErrorHandler({ id: err.code, errors: err })
                    );
                },
            });
    }
}
