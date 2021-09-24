import {
    Component,
    OnInit,
    OnDestroy,
    ChangeDetectorRef,
    OnChanges,
    SimpleChanges,
    ViewChild,
    AfterViewInit,
} from '@angular/core';
import { Store as NgRxStore } from '@ngrx/store';
import { FuseNavigationService } from '@fuse/components/navigation/navigation.service';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { ICardHeaderConfiguration } from 'app/shared/components/card-header/models';
import { UiActions } from 'app/shared/store/actions';
import { locale as english } from './i18n/en';
import { locale as indonesian } from './i18n/id';
import { FeatureState as CollectionCoreState } from './store/reducers';
import { HelperService } from 'app/shared/helpers';
import { CollectionActions } from './store/actions';
import { CollectionSelectors, CollectionType } from './store/selectors';
import { Observable, Subject, Subscription } from 'rxjs';
import { CalculateCollectionStatusPayment, CollectionStatus } from './models';
import {
    AbstractControl,
    FormArray,
    FormBuilder,
    FormControl,
    FormGroup,
    ValidationErrors,
    ValidatorFn,
} from '@angular/forms';
import { SearchByList } from 'app/shared/models/search-by.model';
import { MatTabGroup } from '@angular/material';

@Component({
    selector: 'app-collection',
    templateUrl: './collection.component.html',
    styleUrls: ['./collection.component.scss'],
})
export class CollectionComponent implements OnInit, AfterViewInit, OnDestroy {
    // Untuk penanda tab mana yang sedang aktif.
    @ViewChild(MatTabGroup, { static: true }) tabGroup: MatTabGroup;

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
    subs: Subscription;
    searchByValue: string = this.searchByList[0].id;
    approvalStatusType: number = 0;
    private subs$: Subject<void> = new Subject<void>();
    private _unSubs$: Subject<void> = new Subject<void>();
    selectedList = this.searchByList[0].id;
    selectTab = 0;
    dataTabCollection = [];
    valueSearch: string = '';
    form: FormGroup;
    isDetailPage: any;
    subsData: Subscription;
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
        private fb: FormBuilder,
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

    onSearchByChange(event: string) {
        this.searchByValue = event;
        // localStorage.setItem('searchBy', JSON.stringify(this.searchByValue));
    }

    keyUpKeyword(event: any) {
        this.search = event.target.value;
        this.form.get('searchValue').setValue(this.search);
        // localStorage.setItem('keyword', JSON.stringify(this.search));
    }

    onSelectedTab(index): void {
        this.approvalStatusType = index;
        this.selectTab = index;
        // localStorage.setItem('selectTab', JSON.stringify(this.selectTab));
    }

    ngOnInit(): void {
        this.clickTabViewBy('cStatus');
        this.initForm();
    }

    ngAfterViewInit(): void {
        this.clickTabViewBy('cStatus');
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

        this.subsData = this.dataSource$.subscribe((res) => {
            if (res.length !== 0) {
                this.dataTabCollection = res;
            }
            this.cdRef.markForCheck();
        });

        this.isLoading$ = this.CollectionStore.select(CollectionSelectors.getLoadingState);
        
        this.initForm();
        
        let getDetail = JSON.parse(localStorage.getItem('item'));
        if (getDetail) {
            this.selectTab = getDetail['approvalStatus'];
            this.searchByValue = getDetail['searchBy'];
            this.search = getDetail['keyword'];
            this.form.get('searchValue').setValue(this.search);
        }

        console.log('selectab->', this.selectTab);
    }

    initForm() {
        this.form = this.fb.group({
            searchBy:
                SearchByList.STORE_EXT_ID ||
                SearchByList.STORE_NAME ||
                SearchByList.ORDER_CODE ||
                SearchByList.SALES_REP_NAME ||
                SearchByList.COL_CODE ||
                SearchByList.BILL_PAYM_CODE ||
                SearchByList.REF_CODE,
            searchValue: '',
        });
    }

    ngOnDestroy(): void {
        this.subs$.next();
        this.subs$.complete();
        this.subsData.unsubscribe();
        this.fuseNavigation$.unregister('customNavigation');
    }
}
