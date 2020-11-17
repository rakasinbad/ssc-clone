import {
    ChangeDetectionStrategy,
    Component,
    Input,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { AuthFacadeService } from 'app/main/pages/core/auth/services';
import { HelperService } from 'app/shared/helpers';
import { IQueryParams } from 'app/shared/models/query.model';
import { combineLatest, Observable, Subject } from 'rxjs';
import { debounceTime, filter, takeUntil, tap, withLatestFrom } from 'rxjs/operators';
import { SinbadAutocompleteType } from '../sinbad-autocomplete/models';
import { SegmentTypeAutocomplete } from './models';
import { SegmentTypeService } from './services';

@Component({
    selector: 'segment-type-autocomplete',
    templateUrl: './segment-type-autocomplete.component.html',
    styleUrls: ['./segment-type-autocomplete.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SegmentTypeAutocompleteComponent implements OnInit {
    private unSubs$: Subject<any> = new Subject();

    readonly form: FormControl = new FormControl('');

    collections$: Observable<SegmentTypeAutocomplete[]>;

    @Input()
    limitItem: number = 10;

    @Input()
    limitLength: number;

    @Input()
    type: SinbadAutocompleteType = 'single';

    constructor(
        private authFacade: AuthFacadeService,
        private segmentTypeService: SegmentTypeService
    ) {}

    ngOnInit(): void {
        this.collections$ = this.segmentTypeService.collections$;

        combineLatest([this.form.valueChanges])
            .pipe(
                debounceTime(500),
                withLatestFrom(this.authFacade.getUserSupplier$, ([value], { supplierId }) => ({
                    value,
                    supplierId,
                })),
                tap(({ value, supplierId }) =>
                    HelperService.debug('[SegmentTypeAutocompleteComponent] combineLatest', {
                        value,
                        supplierId,
                    })
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

        /* this.form.valueChanges
            .pipe(
                debounceTime(500),
                tap((value) =>
                    HelperService.debug('[SegmentTypeAutocompleteComponent] valueChanges', {
                        value,
                    })
                ),
                filter((value) => {
                    if (this.limitLength > 0) {
                        return value && value.length >= this.limitLength;
                    }

                    return true;
                }),
                takeUntil(this.unSubs$)
            )
            .subscribe((value) => {
                this._initCollections(value);
            }); */
    }

    private _initCollections(keyword: string, supplierId: string): void {
        HelperService.debug('[SegmentTypeAutocompleteComponent] _initCollections', {
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

        this.segmentTypeService.getWithQuery(params);
    }

    private _initScrollCollections$(skip: number = 0): void {
        const params: IQueryParams = {
            limit: this.limitItem,
            skip,
        };
    }
}
