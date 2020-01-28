import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    OnInit,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { MatSelectionList, MatSelectionListChange } from '@angular/material';
import { fuseAnimations } from '@fuse/animations';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { Store } from '@ngrx/store';
import { IQueryParams, LifecyclePlatform } from 'app/shared/models';
import { sortBy } from 'lodash';
import { combineLatest, Observable, Subject } from 'rxjs';
import { filter, map, takeUntil, tap } from 'rxjs/operators';

import { locale as english } from '../../i18n/en';
import { locale as indonesian } from '../../i18n/id';
import { StorePortfolio } from '../../models';
import { JourneyPlanStoreActions, JourneyPlanStoreSelectedActions } from '../../store/actions';
import * as fromJourneyPlans from '../../store/reducers';
import {
    JourneyPlanStoreSelectedSelectors,
    JourneyPlanStoreSelectors
} from '../../store/selectors';

type TmpAutoCompleteKey = 'sources';

@Component({
    selector: 'app-journey-plan-selected-stores',
    templateUrl: './journey-plan-selected-stores.component.html',
    styleUrls: ['./journey-plan-selected-stores.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class JourneyPlanSelectedStoresComponent implements OnInit, AfterViewInit {
    sources$: Observable<Array<StorePortfolio>>;
    totalItem$: Observable<number>;

    selectedSources$: Observable<Array<StorePortfolio>>;
    totalSelectedSource$: Observable<number>;

    invoiceGroupId$: Observable<string>;

    isLoadingSource$: Observable<boolean>;

    @ViewChild('sourceList', { static: false }) sourceList: MatSelectionList;

    private _unSubs$: Subject<void> = new Subject<void>();
    private _selected: Record<TmpAutoCompleteKey, Array<StorePortfolio>> = { sources: [] };

    constructor(
        private store: Store<fromJourneyPlans.FeatureState>,
        private _fuseTranslationLoaderService: FuseTranslationLoaderService
    ) {}

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

    getSelected(item: StorePortfolio): boolean {
        if (!item || !this._selected.sources.length) {
            return false;
        }

        const idx = this._selected.sources.findIndex(source => source.id === item.id);

        return idx === -1 ? false : true;
    }

    onClearAll(total: number): void {
        if (!total) {
            return;
        }

        window.console.log(total);
        window.console.log(this._selected.sources);

        const ids = this._selected.sources.map(row => row.id);

        this.store.dispatch(
            JourneyPlanStoreSelectedActions.confirmClearAllSelectedStores({ payload: ids })
        );
    }

    onSelectionSource(ev: MatSelectionListChange, type: 'source' | 'selectedSource'): void {
        window.console.log(ev);

        if (!type) {
            return;
        }

        switch (type) {
            case 'source':
                {
                    const item = ev.option.value as StorePortfolio;

                    if (ev.option.selected) {
                        this.store.dispatch(
                            JourneyPlanStoreSelectedActions.addSelectedStores({ payload: item })
                        );
                    } else {
                        this.store.dispatch(
                            JourneyPlanStoreSelectedActions.deleteSelectedStores({
                                payload: item.id
                            })
                        );
                    }
                }
                break;

            default:
                break;
        }
    }

    private _initPage(lifeCycle?: LifecyclePlatform): void {
        switch (lifeCycle) {
            case LifecyclePlatform.AfterViewInit:
                break;

            default:
                // Load translate
                this._fuseTranslationLoaderService.loadTranslations(indonesian, english);

                this.invoiceGroupId$ = this.store.select(
                    JourneyPlanStoreSelectors.getInvoiceGroupId
                );

                combineLatest([
                    this.store.select(JourneyPlanStoreSelectors.getType),
                    this.store.select(JourneyPlanStoreSelectors.getInvoiceGroupId)
                ])
                    .pipe(
                        // distinctUntilChanged(),
                        map(([type, invoiceGroupId]) => ({ type, invoiceGroupId })),
                        filter(({ type, invoiceGroupId }) => {
                            window.console.log(type, invoiceGroupId);

                            return !!invoiceGroupId;
                        }),
                        // take(1),
                        takeUntil(this._unSubs$)
                    )
                    .subscribe(({ type, invoiceGroupId }) => {
                        window.console.log(`Type: ${type}`);
                        window.console.log(`InvoiceGroupId: ${invoiceGroupId}`);

                        if (type && invoiceGroupId) {
                            const data: IQueryParams = {
                                limit: 10,
                                skip: 0
                            };

                            data['paginate'] = true;

                            data['search'] = [
                                {
                                    fieldName: 'type',
                                    keyword: type
                                },
                                {
                                    fieldName: 'invoiceGroupId',
                                    keyword: invoiceGroupId
                                }
                            ];

                            this.store.dispatch(
                                JourneyPlanStoreActions.fetchJourneyPlanStoresRequest({
                                    payload: data
                                })
                            );
                        }
                    });

                this.sources$ = this.store.select(JourneyPlanStoreSelectors.selectAll);
                this.totalItem$ = this.store.select(JourneyPlanStoreSelectors.getTotalItem);

                this.selectedSources$ = this.store
                    .select(JourneyPlanStoreSelectedSelectors.selectAll)
                    .pipe(
                        map(item => sortBy(item, ['name'], ['asc'])),
                        tap(sources => {
                            this._selected.sources = sources;
                        })
                    );
                this.totalSelectedSource$ = this.store.select(
                    JourneyPlanStoreSelectedSelectors.selectTotal
                );

                this.isLoadingSource$ = this.store.select(JourneyPlanStoreSelectors.getIsLoading);
                break;
        }
    }
}
