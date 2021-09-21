import { Component, OnInit, OnDestroy, ChangeDetectorRef, OnChanges } from '@angular/core';
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
import { CalculateCollectionStatusPayment, CollectionStatus } from './models';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
    selector: 'app-collection',
    templateUrl: './collection.component.html',
    styleUrls: ['./collection.component.scss'],
})
export class CollectionComponent implements OnInit, OnChanges, OnDestroy {
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
    searchByValue: any = 'storeExternalId';
    approvalStatusType: number = 0;
    private subs$: Subject<void> = new Subject<void>();
    private _unSubs$: Subject<void> = new Subject<void>();
    searchByFormGroup: FormGroup;

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
        private fb: FormBuilder,
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

        const COLLECTION_STATUS = 101;
        const COLLECTION_BILLING = 201;

        switch (action) {
            case 'cStatus':
                this.selectedViewBy = action;
                this.getDataTab(COLLECTION_STATUS);
                break;
            case 'bStatus':
                this.selectedViewBy = action;
                this.getDataTab(COLLECTION_BILLING);
            default:
                return;
        }
    }

    onSearchByChange(event) {
        this.searchByValue = event.value;
    }

    keyUpKeyword(event: any) {
        this.search = event.target.value;
    }

    onSelectedTab(index): void {
        this.approvalStatusType = index;
    }

    ngOnInit(): void {
        this.searchByFormGroup = this.fb.group({
            searchByFormGroup: ['storeExternalId'],
        });

        const toSelect = this.searchByList.find((c) => c.id == 'storeExternalId');
        this.searchByFormGroup.get('searchByFormGroup').setValue(toSelect);
        this.searchByValue = this.searchByFormGroup.get('searchByFormGroup').get('id');
        console.log('searchByFormGroup->', this.searchByFormGroup);
        console.log('searchbyvalue->', this.searchByValue);

    }

    ngAfterViewInit(): void {
       
    }

    ngOnChanges(): void {
        
    }

    onClickSubmit(value) {
        console.log('isi value submit->', value)
    }

    getDataTab(index): void {
        let parameter = {};
        parameter['type'] = index;
        this.CollectionStore.dispatch(
            CollectionActions.fetchCalculateCollectionStatusRequest({
                payload: parameter,
            })
        );

        this.dataSource$ = this.CollectionStore.select(CollectionType.getCalculateData);

        this.isLoading$ = this.CollectionStore.select(CollectionSelectors.getLoadingState);

        this.cdRef.detectChanges();
    }

    ngOnDestroy(): void {
        this.subs$.next();
        this.subs$.complete();
        this.fuseNavigation$.unregister('customNavigation');
        //   this.subs.unsubscribe();
    }
}
