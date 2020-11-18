import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output,
    ViewEncapsulation,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { AuthFacadeService } from 'app/main/pages/core/auth/services';
import { HelperService } from 'app/shared/helpers';
import { IQueryParams } from 'app/shared/models/query.model';
import { combineLatest, Observable, Subject } from 'rxjs';
import { debounceTime, filter, map, take, takeUntil, tap, withLatestFrom } from 'rxjs/operators';
import { SinbadAutocompleteSource, SinbadAutocompleteType } from '../sinbad-autocomplete/models';
import { SegmentGroupAutocomplete } from './models';
import { SegmentGroupService } from './services';

@Component({
    selector: 'segment-group-autocomplete',
    templateUrl: './segment-group-autocomplete.component.html',
    styleUrls: ['./segment-group-autocomplete.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SegmentGroupAutocompleteComponent implements OnInit, OnDestroy {
    private unSubs$: Subject<any> = new Subject();

    readonly form: FormControl = new FormControl('');
    readonly placeholder: string = 'Group';

    collections$: Observable<SegmentGroupAutocomplete[]>;
    loading$: Observable<boolean>;

    @Input()
    limitItem: number = 10;

    @Input()
    limitLength: number;

    @Input()
    loading: boolean;

    @Output()
    loadingChange: EventEmitter<boolean> = new EventEmitter();

    @Output()
    selectedValue: EventEmitter<
        SinbadAutocompleteSource | SinbadAutocompleteSource[]
    > = new EventEmitter();

    @Input()
    type: SinbadAutocompleteType = 'single';

    constructor(
        private authFacade: AuthFacadeService,
        private segmentGroupService: SegmentGroupService
    ) {}

    ngOnInit(): void {
        this.collections$ = this.segmentGroupService.collections$;
        this.loading$ = this.segmentGroupService.loading$;

        combineLatest([this.form.valueChanges])
            .pipe(
                debounceTime(500),
                withLatestFrom(this.authFacade.getUserSupplier$, ([value], { supplierId }) => ({
                    value: this._convertKeyword(value),
                    supplierId,
                })),
                tap(({ value, supplierId }) =>
                    HelperService.debug(
                        '[SegmentGroupAutocompleteComponent] ngOnInit combineLatest',
                        {
                            value,
                            supplierId,
                        }
                    )
                ),
                filter(({ value, supplierId }) => {
                    if (this.limitLength > 0) {
                        return value && value.length >= this.limitLength && !!supplierId;
                    }

                    return !!supplierId;
                }),
                takeUntil(this.unSubs$)
            )
            .subscribe({
                next: ({ value, supplierId }) => {
                    this._initCollections(value, supplierId);
                },
            });
    }

    ngOnDestroy(): void {
        this.unSubs$.next();
        this.unSubs$.complete();

        this.segmentGroupService.reset();
    }

    onClosedAutocompete(): void {
        HelperService.debug('[SegmentGroupAutocompleteComponent] onClosedAutocompete');

        this.form.reset();
    }

    onOpenedAutocomplete(): void {
        HelperService.debug('[SegmentGroupAutocompleteComponent] onOpenedAutocomplete');

        this.authFacade.getUserSupplier$
            .pipe(
                take(1),
                map(({ supplierId }) => ({
                    value: this._convertKeyword(this.form.value),
                    supplierId,
                })),
                filter(({ supplierId }) => !!supplierId)
            )
            .subscribe({
                next: ({ value, supplierId }) => {
                    this._initCollections(value, supplierId);
                },
                complete: () =>
                    HelperService.debug(
                        '[SegmentGroupAutocompleteComponent] onOpenedAutocomplete complete'
                    ),
            });
    }

    onScrollToBottom(): void {
        combineLatest([this.segmentGroupService.totalCollections$, this.segmentGroupService.total$])
            .pipe(
                map(([totalCollections, total]) => ({ totalCollections, total })),
                withLatestFrom(
                    this.authFacade.getUserSupplier$,
                    ({ totalCollections, total }, { supplierId }) => ({
                        totalCollections,
                        total,
                        value: this._convertKeyword(this.form.value),
                        supplierId,
                    })
                ),
                filter(
                    ({ totalCollections, total }) =>
                        totalCollections && total && totalCollections < total
                ),
                take(1)
            )
            .subscribe({
                next: ({ totalCollections, value, supplierId }) => {
                    HelperService.debug(
                        '[SegmentGroupAutocompleteComponent] onScrollToBottom next',
                        {
                            totalCollections,
                            value,
                            supplierId,
                        }
                    );

                    this._initScrollCollections(totalCollections, value, supplierId);
                },
                complete: () =>
                    HelperService.debug(
                        '[SegmentGroupAutocompleteComponent] onScrollToBottom complete'
                    ),
            });
    }

    onSelectedAutocomplete(value: SinbadAutocompleteSource): void {
        HelperService.debug('[SegmentGroupAutocompleteComponent] onSelectedAutocomplete', {
            value,
        });

        this.selectedValue.emit(value);
    }

    private _initCollections(keyword: string, supplierId: string): void {
        HelperService.debug('[SegmentGroupAutocompleteComponent] _initCollections', {
            keyword,
        });

        const params: IQueryParams = {
            paginate: true,
            limit: this.limitItem,
            skip: 0,
        };

        params['search'] = [
            {
                fieldName: 'hasChild',
                keyword: 'false',
            },
            {
                fieldName: 'supplierId',
                keyword: supplierId,
            },
        ];

        if (keyword) {
            params['search'].push({
                fieldName: 'keyword',
                keyword,
            });
        }

        this.segmentGroupService.getWithQuery(params);
    }

    private _initScrollCollections(skip: number = 0, keyword: string, supplierId: string): void {
        HelperService.debug('[SegmentGroupAutocompleteComponent] _initScrollCollections', {
            skip,
        });

        const params: IQueryParams = {
            paginate: true,
            limit: this.limitItem,
            skip,
        };

        params['search'] = [
            {
                fieldName: 'hasChild',
                keyword: 'false',
            },
            {
                fieldName: 'supplierId',
                keyword: supplierId,
            },
        ];

        if (keyword) {
            params['search'].push({
                fieldName: 'keyword',
                keyword,
            });
        }

        this.segmentGroupService.getWithQuery(params);
    }

    private _convertKeyword(value: any): string {
        return value && value.hasOwnProperty('id') && typeof value !== 'string'
            ? ((value as unknown) as SegmentGroupAutocomplete).label
            : value;
    }
}
