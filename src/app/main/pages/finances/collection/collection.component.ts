import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Store as NgRxStore } from '@ngrx/store';
import { FuseNavigationService } from '@fuse/components/navigation/navigation.service';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { ICardHeaderConfiguration } from 'app/shared/components/card-header/models';
import { UiActions } from 'app/shared/store/actions';
import { locale as english } from './i18n/en';
import { locale as indonesian } from './i18n/id';
import { FeatureState as CollectionCoreState } from './store/reducers';
import { SearchByList } from 'app/shared/models/search-by.model';
import { ErrorMessageService, HelperService, NoticeService } from 'app/shared/helpers';
import { LifecyclePlatform } from 'app/shared/models/global.model';
import { CollectionActions } from './store/actions';
import { UiSelectors } from 'app/shared/store/selectors';
import { CollectionSelectors, CollectionType } from './store/selectors';
import { combineLatest, merge, Observable, Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, takeUntil, map } from 'rxjs/operators';
import { CalculateCollectionStatusPayment } from './models';

@Component({
    selector: 'app-collection',
    templateUrl: './collection.component.html',
    styleUrls: ['./collection.component.scss'],
})
export class CollectionComponent implements OnInit, OnDestroy {
    // Untuk penanda tab mana yang sedang aktif.

    // tslint:disable-next-line: no-inferrable-types
    search: string = '';
    selectedViewBy: string = 'cStatus';
    labelInfo: string = '';
    isHidden: boolean = false;
    allPayment: number = 2;
    waiting: number = 1;
    approvedCollection: number = 1;
    rejectedCollection: number = 1;
    selectedValue: string;
    searchByList = this._$helperService.searchByList();
    selectedTab: string;
    subs: Subscription;
    searchByValue: string;

    private subs$: Subject<void> = new Subject<void>();
    private _unSubs$: Subject<void> = new Subject<void>();

    // Untuk menentukan konfigurasi card header.
    cardHeaderConfig: ICardHeaderConfiguration = {
        title: {
            label: 'Collection',
        },
        search: {
            active: false,
        },
        viewBy: {
            list: [
                { id: 'cStatus', label: 'Collection Status' },
                { id: 'bStatus', label: 'Billing Status' },
            ],
            onChanged: (value: { id: string; label: string }) => this.clickTabViewBy(value.id),
        },
    };

    // Untuk menangkap status loading dari state.
    isLoading$: Observable<boolean>;
    dataSource$: Observable<Array<CalculateCollectionStatusPayment>>;

    constructor(
        private CollectionStore: NgRxStore<CollectionCoreState>,
        private fuseNavigation$: FuseNavigationService,
        private fuseTranslationLoader$: FuseTranslationLoaderService,
        private _$helperService: HelperService,
        private cdRef: ChangeDetectorRef
    ) {
        // Memuat terjemahan.
        this.fuseTranslationLoader$.loadTranslations(indonesian, english);

        //   Memuat breadcrumb.
        this.CollectionStore.dispatch(
            UiActions.createBreadcrumb({
                payload: [
                    {
                        title: 'Home',
                    },
                    {
                        title: 'Finance',
                    },
                    {
                        title: 'Collection',
                        active: true,
                        keepCase: true,
                    },
                ],
            })
        );
    }

    clickTabViewBy(action: string): void {
        if (!action) {
            return;
        }

        switch (action) {
            case 'cStatus':
                this.selectedViewBy = action;
                this.getDataTab(101);
                break;
            case 'bStatus':
                this.selectedViewBy = action;
                this.getDataTab(201);
            default:
                return;
        }
    }

    onSearchByChange(event) {
        this.searchByValue = event.value;
        console.log('isi event->', event.value);
    }

    onSelectedTab(index): void {
        console.log(index);
    }

    ngOnInit(): void {
        // this.onSelectedTab(0);
    }

    ngAfterViewInit(): void {
        // console.log('selectedValue=>')
    }

    getDataTab(index): void {
        console.log('index->', index);
        let parameter = {};
        parameter['type'] = index;
        console.log('parameter-=>', parameter)
        this.CollectionStore.dispatch(
            CollectionActions.fetchCalculateCollectionStatusRequest({
                payload: parameter,
            })
        );
        this.isLoading$ = this.CollectionStore.select(CollectionSelectors.getLoadingState);

        this.dataSource$ = this.CollectionStore.select(CollectionType.getCalculateData);
        this.dataSource$.pipe(takeUntil(this._unSubs$)).subscribe((value) => {
            console.log('isi value->', value);
            // this.form.get('supplierId').patchValue(supplierId);
        });

        console.log('this.datasource->', this.dataSource$);

        // this.subs = this.dataSource$.subscribe(res => {
        //     console.log('isi res->', res)
        // })
        this.cdRef.detectChanges();
    }

    ngOnDestroy(): void {
        this.subs$.next();
        this.subs$.complete();
        this.fuseNavigation$.unregister('customNavigation');
        //   this.subs.unsubscribe();
    }
}
