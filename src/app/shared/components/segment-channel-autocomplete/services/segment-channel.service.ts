import { Injectable } from '@angular/core';
import { HelperService } from 'app/shared/helpers';
import { ErrorHandler, PaginateResponse } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { SegmentChannelAutocomplete, SegmentChannelResponse } from '../models';
import { SegmentChannelAutocompleteModule } from '../segment-channel-autocomplete.module';
import { SegmentChannelApiService } from './segment-channel-api.service';

@Injectable({ providedIn: SegmentChannelAutocompleteModule })
export class SegmentChannelService {
    private _collections$: BehaviorSubject<SegmentChannelAutocomplete[]> = new BehaviorSubject([]);
    private _loading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
    private _totalCollections$: BehaviorSubject<number> = new BehaviorSubject(0);
    private _total$: BehaviorSubject<number> = new BehaviorSubject(0);

    readonly collections$: Observable<
        SegmentChannelAutocomplete[]
    > = this._collections$.asObservable();
    readonly loading$: Observable<boolean> = this._loading$.asObservable();
    readonly totalCollections$: Observable<number> = this._totalCollections$.asObservable();
    readonly total$: Observable<number> = this._total$.asObservable();

    constructor(
        private segmentChannelApiService: SegmentChannelApiService,
        private helperService: HelperService
    ) {}

    getWithQuery(params: IQueryParams): void {
        this._loading$.next(true);

        this.segmentChannelApiService
            .getWithQuery<PaginateResponse<SegmentChannelResponse>>(params)
            .pipe(
                map((resp) => {
                    const newResp = {
                        data:
                            resp && resp.data && resp.data.length > 0
                                ? resp.data.map(
                                      (item) =>
                                          new SegmentChannelAutocomplete({
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
                tap((resp) => HelperService.debug('[SegmentChannelService] getWithQuery', { resp }))
            )
            .subscribe({
                next: ({ data, total }) => {
                    this._collections$.next(data);
                    this._totalCollections$.next(data.length);

                    this._total$.next(total);
                    this._loading$.next(false);
                },
                complete: () =>
                    HelperService.debug('[SegmentChannelService] getWithQuery complete'),
                error: (err) => {
                    this._loading$.next(false);
                    HelperService.debug('[SegmentChannelService] getWithQuery error', { err });
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
}
