import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    Input,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import {
    MatAutocomplete,
    MatAutocompleteSelectedEvent,
    MatAutocompleteTrigger,
    MatTabGroup
} from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { Store } from '@ngrx/store';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { ErrorMessageService, HelperService } from 'app/shared/helpers';
import { LifecyclePlatform } from 'app/shared/models/global.model';
import { Portfolio } from 'app/shared/models/portfolio.model';
import { IQueryParams } from 'app/shared/models/query.model';
import { FormActions, PortfolioActions } from 'app/shared/store/actions';
import { PortfolioSelectors } from 'app/shared/store/selectors/sources';
import { fromEvent, Observable, Subject } from 'rxjs';
import {
    debounceTime,
    distinctUntilChanged,
    filter,
    map,
    takeUntil,
    withLatestFrom
} from 'rxjs/operators';

import { locale as english } from '../../i18n/en';
import { locale as indonesian } from '../../i18n/id';
import { JourneyPlanActions, JourneyPlanStoreActions } from '../../store/actions';
import * as fromJourneyPlans from '../../store/reducers';
import { JourneyPlanSelectors } from '../../store/selectors';

type TmpAutoCompleteKey = 'portfolio';

@Component({
    selector: 'app-journey-plan-store',
    templateUrl: './journey-plan-store.component.html',
    styleUrls: ['./journey-plan-store.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class JourneyPlanStoreComponent implements OnInit, AfterViewInit, OnDestroy {
    form: FormGroup;
    field: Record<TmpAutoCompleteKey, { highlight: string; typing: boolean }> = {
        portfolio: {
            highlight: '',
            typing: false
        }
    };

    portfolios$: Observable<Array<Portfolio>>;

    isLoadingPortfolio$: Observable<boolean>;

    @Input() readonly pageType: 'new' | 'edit' = 'new';

    @ViewChild(MatTabGroup, { static: true }) tabGroup: MatTabGroup;
    @ViewChild('autoPortfolio', { static: false }) autoPortfolio: MatAutocomplete;
    @ViewChild('triggerPortfolio', { static: false, read: MatAutocompleteTrigger })
    triggerPortfolio: MatAutocompleteTrigger;

    private _unSubs$: Subject<void> = new Subject<void>();
    private _selected: Record<TmpAutoCompleteKey, string> = { portfolio: '' };
    private _timer: Record<TmpAutoCompleteKey, NodeJS.Timer> = { portfolio: null };

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private store: Store<fromJourneyPlans.FeatureState>,
        private _fuseTranslationLoaderService: FuseTranslationLoaderService,
        private _$errorMessage: ErrorMessageService
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.

        this._initPage();
    }

    ngAfterViewInit(): void {
        // Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
        // Add 'implements AfterViewInit' to the class.

        this._initPage(LifecyclePlatform.AfterViewInit);
    }

    ngOnDestroy(): void {
        // Called once, before the instance is destroyed.
        // Add 'implements OnDestroy' to the class.

        this._initPage(LifecyclePlatform.OnDestroy);
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    displayOption(item: Portfolio, field: string, isHtml = false): string {
        switch (field) {
            case 'portfolio': {
                const row = item as Portfolio;

                if (!isHtml) {
                    return row.name;
                }

                return `<span class="subtitle">${row.name}</span>`;
            }

            default:
                return;
        }
    }

    getErrorMessage(field: string): string {
        if (field) {
            const { errors } = this.form.get(field);

            if (errors) {
                const type = Object.keys(errors)[0];

                if (type) {
                    return errors[type].message;
                }
            }
        }
    }

    getHighlight(name: string): string {
        if (!name) {
            return;
        }

        return this.field[name].highlight || '';
    }

    hasError(field: string, isMatError = false): boolean {
        if (!field) {
            return;
        }

        const errors = this.form.get(field).errors;
        const touched = this.form.get(field).touched;
        const dirty = this.form.get(field).dirty;

        if (isMatError) {
            return errors && (dirty || touched);
        }

        return errors && ((touched && dirty) || touched);
    }

    hasLength(field: string, minLength: number): boolean {
        if (!field || !minLength) {
            return;
        }

        const value = this.form.get(field).value;

        return !value ? true : value.length <= minLength;
    }

    onDisplayPortfolio(item: Portfolio): string {
        if (!item) {
            return;
        }

        return HelperService.truncateText(item.name, 40, 'start');
    }

    onKeydown(ev: KeyboardEvent, field: string): void {
        if (!field) {
            return;
        }

        clearTimeout(this._timer[field]);
    }

    onKeyup(ev: KeyboardEvent, field: string): void {
        switch (field) {
            case 'portfolio':
                {
                    if (!(ev.target as any).value || (ev.target as any).value.length < 3) {
                        this.store.dispatch(PortfolioActions.clearPortfolioState());
                        return;
                    }

                    this.field.portfolio.typing = true;

                    clearTimeout(this._timer[field]);

                    this._timer[field] = setTimeout(() => {
                        this.field.portfolio.typing = false;
                    }, 100);
                }
                break;

            default:
                return;
        }
    }

    onOpenAutocomplete(field: string): void {
        switch (field) {
            case 'portfolio':
                {
                    if (this.autoPortfolio && this.autoPortfolio.panel && this.triggerPortfolio) {
                        fromEvent(this.autoPortfolio.panel.nativeElement, 'scroll')
                            .pipe(
                                map(x => this.autoPortfolio.panel.nativeElement.scrollTop),
                                withLatestFrom(
                                    this.store.select(JourneyPlanSelectors.selectTotal),
                                    this.store.select(JourneyPlanSelectors.getTotalItem)
                                ),
                                takeUntil(this.triggerPortfolio.panelClosingActions)
                            )
                            .subscribe(([x, skip, total]) => {
                                const scrollTop = this.autoPortfolio.panel.nativeElement.scrollTop;
                                const scrollHeight = this.autoPortfolio.panel.nativeElement
                                    .scrollHeight;
                                const elementHeight = this.autoPortfolio.panel.nativeElement
                                    .clientHeight;
                                const atBottom = scrollHeight === scrollTop + elementHeight;

                                if (atBottom && skip && total && skip < total) {
                                    const data: IQueryParams = {
                                        limit: 10,
                                        skip: skip
                                    };

                                    data['paginate'] = true;

                                    if (this.field.portfolio.highlight) {
                                        data['search'] = [
                                            {
                                                fieldName: 'keyword',
                                                keyword: this.field.portfolio.highlight
                                            }
                                        ];

                                        this.store.dispatch(
                                            JourneyPlanActions.fetchJourneyPlansRequest({
                                                payload: data
                                            })
                                        );
                                    }
                                }
                            });
                    }
                }
                break;

            default:
                return;
        }
    }

    onSelectAutocomplete(ev: MatAutocompleteSelectedEvent, field: string): void {
        switch (field) {
            case 'portfolio':
                {
                    const value = (ev.option.value as Portfolio) || '';

                    if (!value) {
                        this.form.get('portfolio').reset();

                        // Reset invoiceGroupId State
                        this.store.dispatch(JourneyPlanStoreActions.clearInvoiceGroupIdState());

                        // Reset source store
                        this.store.dispatch(JourneyPlanStoreActions.clearStoreState());
                    }

                    this._selected.portfolio = value ? JSON.stringify(value) : '';

                    if (value && value.invoiceGroupId) {
                        this.store.dispatch(
                            JourneyPlanStoreActions.setInvoiceGroupId({
                                payload: value.invoiceGroupId
                            })
                        );
                    }
                }
                break;

            default:
                return;
        }
    }

    onSelectedIndexChange(idx: number): void {
        window.console.log(`Idx: ${idx}`);

        if (idx === 0) {
            this.store.dispatch(JourneyPlanStoreActions.setFilterStore({ payload: 'inside' }));
        } else if (idx === 1) {
            this.store.dispatch(JourneyPlanStoreActions.setFilterStore({ payload: 'outside' }));
        }
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    private _initPage(lifeCycle?: LifecyclePlatform): void {
        switch (lifeCycle) {
            case LifecyclePlatform.AfterViewInit:
                // Handle trigger autocomplete portfolio force selected from options
                this.triggerPortfolio.panelClosingActions
                    .pipe(takeUntil(this._unSubs$))
                    .subscribe(e => {
                        const portfolioField = this.form.get('portfolio');

                        if (
                            !this._selected.portfolio ||
                            this._selected.portfolio !== JSON.stringify(portfolioField.value)
                        ) {
                            // Set input portfolio empty
                            portfolioField.setValue('');

                            // Set selected portfolio empty (helper check User is choose from option or not)
                            this._selected.portfolio = '';

                            // Reset invoiceGroupId State
                            this.store.dispatch(JourneyPlanStoreActions.clearInvoiceGroupIdState());

                            // Reset source store
                            this.store.dispatch(JourneyPlanStoreActions.clearStoreState());
                        }
                    });

                if (this.tabGroup) {
                    if (this.tabGroup.selectedIndex === 0) {
                        this.store.dispatch(
                            JourneyPlanStoreActions.setFilterStore({
                                payload: 'inside'
                            })
                        );
                    }
                }
                break;

            case LifecyclePlatform.OnDestroy:
                // Reset form status state
                this.store.dispatch(FormActions.resetFormStatus());

                // Reset click save button state
                this.store.dispatch(FormActions.resetClickSaveButton());

                this._unSubs$.next();
                this._unSubs$.complete();
                break;

            default:
                // Load translate
                this._fuseTranslationLoaderService.loadTranslations(indonesian, english);

                this.portfolios$ = this.store.select(PortfolioSelectors.selectAll);

                this.isLoadingPortfolio$ = this.store.select(PortfolioSelectors.getIsLoading);

                this._initForm();

                // Handle valid or invalid form status for footer action (SHOULD BE NEEDED)
                this.form.statusChanges
                    .pipe(distinctUntilChanged(), debounceTime(1000), takeUntil(this._unSubs$))
                    .subscribe(status => {
                        this._setFormStatus(status);
                    });

                // Handle search portfolio autocomplete & try request to endpoint
                this.form
                    .get('portfolio')
                    .valueChanges.pipe(
                        filter(v => {
                            this.field.portfolio.highlight = v;
                            return v.length >= 3;
                        }),
                        takeUntil(this._unSubs$)
                    )
                    .subscribe(v => {
                        if (v) {
                            const data: IQueryParams = {
                                limit: 10,
                                skip: 0
                            };

                            data['paginate'] = true;

                            data['search'] = [
                                {
                                    fieldName: 'keyword',
                                    keyword: v
                                }
                            ];

                            this.field.portfolio.highlight = v;

                            this.store.dispatch(
                                PortfolioActions.searchPortfolioRequest({ payload: data })
                            );
                        }
                    });
                break;
        }
    }

    private _initForm(): void {
        if (this.pageType === 'new') {
            this.form = this.formBuilder.group({
                startDate: [
                    '',
                    [
                        RxwebValidators.required({
                            message: this._$errorMessage.getErrorMessageNonState(
                                'default',
                                'required'
                            )
                        })
                    ]
                ],
                endDate: '',
                portfolio: ''
            });
        }
    }

    private _setFormStatus(status: string): void {
        if (!status) {
            return;
        }

        if (status === 'VALID' || !this.form.pristine) {
            this.store.dispatch(FormActions.setFormStatusValid());
        }

        if (status === 'INVALID' || this.form.pristine) {
            this.store.dispatch(FormActions.setFormStatusInvalid());
        }
    }
}
