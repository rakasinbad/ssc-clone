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
import { SegmentClusterAutocomplete } from './models';
import { SegmentClusterService } from './services';

@Component({
    selector: 'segment-cluster-autocomplete',
    templateUrl: './segment-cluster-autocomplete.component.html',
    styleUrls: ['./segment-cluster-autocomplete.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SegmentClusterAutocompleteComponent implements OnInit, OnDestroy {
    private selectedItem: string;
    private unSubs$: Subject<any> = new Subject();

    readonly form: FormControl = new FormControl('');
    readonly placeholder: string = 'Cluster';

    collections$: Observable<SegmentClusterAutocomplete[]>;
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
        private segmentClusterService: SegmentClusterService
    ) {}

    ngOnInit(): void {
        this.collections$ = this.segmentClusterService.collections$;
        this.loading$ = this.segmentClusterService.loading$;

        combineLatest([this.form.valueChanges])
            .pipe(
                debounceTime(500),
                withLatestFrom(this.authFacade.getUserSupplier$, ([value], { supplierId }) => ({
                    value: this._convertKeyword(value),
                    supplierId,
                })),
                tap(({ value, supplierId }) =>
                    HelperService.debug(
                        '[SegmentClusterAutocompleteComponent] ngOnInit combineLatest',
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

        this.segmentClusterService.reset();
    }

    onClosedAutocompete(): void {
        HelperService.debug('[SegmentClusterAutocompleteComponent] onClosedAutocompete', {
            form: this.form,
            typeForm: typeof this.form.value,
        });

        const formValue =
            typeof this.form.value === 'object' ? JSON.stringify(this.form.value) : this.form.value;

        if (!this.selectedItem || this.selectedItem !== formValue) {
            this.form.reset();
            this.selectedItem = null;
            this.selectedValue.emit(null);
        }
    }

    onOpenedAutocomplete(): void {
        HelperService.debug('[SegmentClusterAutocompleteComponent] onOpenedAutocomplete');

        this.authFacade.getUserSupplier$
            .pipe(
                take(1),
                map(({ supplierId }) => ({
                    value: this._convertKeyword(this.form.value),
                    supplierId,
                })),
                filter(({ value, supplierId }) => !value && !!supplierId)
            )
            .subscribe({
                next: ({ value, supplierId }) => {
                    this._initCollections(value, supplierId);
                },
                complete: () =>
                    HelperService.debug(
                        '[SegmentClusterAutocompleteComponent] onOpenedAutocomplete complete'
                    ),
            });
    }

    onScrollToBottom(): void {
        combineLatest([
            this.segmentClusterService.totalCollections$,
            this.segmentClusterService.total$,
        ])
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
                        '[SegmentClusterAutocompleteComponent] onScrollToBottom next',
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
                        '[SegmentClusterAutocompleteComponent] onScrollToBottom complete'
                    ),
            });
    }

    onSelectedAutocomplete(value: SinbadAutocompleteSource): void {
        HelperService.debug('[SegmentClusterAutocompleteComponent] onSelectedAutocomplete', {
            value,
        });

        this.selectedItem = value ? JSON.stringify(value) : null;

        this.selectedValue.emit(value);
    }

    private _initCollections(keyword: string, supplierId: string): void {
        HelperService.debug('[SegmentClusterAutocompleteComponent] _initCollections', {
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

        this.segmentClusterService.getWithQuery(params);
    }

    private _initScrollCollections(skip: number = 0, keyword: string, supplierId: string): void {
        HelperService.debug('[SegmentClusterAutocompleteComponent] _initScrollCollections', {
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

        this.segmentClusterService.getWithQuery(params);
    }

    private _convertKeyword(value: any): string {
        return value && value.hasOwnProperty('id') && typeof value !== 'string'
            ? ((value as unknown) as SegmentClusterAutocomplete).label
            : value;
    }
}
