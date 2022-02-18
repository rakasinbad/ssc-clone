import {
    Component,
    OnInit,
    OnDestroy,
    ChangeDetectorRef,
    ViewChild,
    ViewEncapsulation,
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
import { CalculateCollectionStatusPayment } from './models';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatTabGroup } from '@angular/material';
import { Router } from '@angular/router';

@Component({
    selector: 'app-collection',
    templateUrl: './collection.component.html',
    styleUrls: ['./collection.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class CollectionComponent implements OnInit, OnDestroy {
    // Untuk penanda tab mana yang sedang aktif.
    @ViewChild(MatTabGroup, { static: true }) tabGroup: MatTabGroup;

    // tslint:disable-next-line: no-inferrable-types
    search: string = '';
    selectedViewBy: string = 'cStatus';
    labelInfo: string = '';
    //hidden status filter
    isHiddenTab: boolean = false;
    allPayment: number = 2;
    waiting: number = 1;
    approvedCollection: number = 1;
    rejectedCollection: number = 1;
    selectedValue: string;
    searchByList = this._$helperService.searchByList();
    searchByListCollection = this._$helperService.searchByListCollection();
    searchByListBilling = this._$helperService.searchByListBilling();
    subs: Subscription;
    searchByValue: string = this.searchByList[0].id;
    searchByValueCollection: string = this.searchByListCollection[0].id;
    searchByValueBilling: string = this.searchByListBilling[0].id;
    approvalStatusType: number = 0;
    private subs$: Subject<void> = new Subject<void>();
    private _unSubs$: Subject<void> = new Subject<void>();
    selectedList = this.searchByList[0].id;
    selectedListCollection = this.searchByListCollection[0].id;
    selectedListBilling = this.searchByListBilling[0].id;
    selectTab: number;
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
        private cdRef: ChangeDetectorRef,
        private router: Router
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

    changeRoute(action: { route: string }): void {
        if (action.route === 'collection') this.isHiddenTab = false;
        else this.isHiddenTab = true;
    }

    clickTabViewBy(action: string): void {
        if (!action) {
            return;
        }

        const COLLECTION_STATUS = 101;
        const COLLECTION_BILLING = 201;

        switch (action) {
            case 'cStatus':
                this.changeRoute({ route: 'collection' });
                this.selectedViewBy = action;
                this.getDataTab(COLLECTION_STATUS);

                break;
            case 'bStatus':
                this.changeRoute({ route: 'billing' });
                this.selectedViewBy = action;
                this.getDataTab(COLLECTION_BILLING);
            default:
                return;
        }
    }

    onSearchByChange(event: string) {
        if (this.selectedViewBy == 'cStatus') {
            this.searchByValueCollection = event;
        } else {
            this.searchByValueBilling = event;
        }
    }

    keyUpKeyword(event: any) {
        this.form.get('searchValue').setValue(event.target.value);
        if (event.keyCode === 13) {
            this.searchKeyword();
        }
    }

    searchKeyword(): void {
        this.search = this.form.get('searchValue').value;
    }

    ngOnInit(): void {
        const isFromDetail = JSON.parse(localStorage.getItem('isFromDetail'));

        this.initForm();

        this.dataSource$ = this.CollectionStore.select(CollectionType.getCalculateData);
        this.subsData = this.dataSource$.subscribe((res) => {
            if (res.length !== 0) {
                this.dataTabCollection = res;
                if (isFromDetail) {
                    const item = JSON.parse(localStorage.getItem('item'));

                    if (item) {
                        this.selectTab = item.approvalStatus;
                    } else {
                        this.selectTab = 0;
                        this.search = '';
                        this.form.get('searchValue').setValue(this.search);
                    }

                    localStorage.setItem('isFromDetail', 'false');
                } else {
                    this.searchByValue = this.searchByList[0].id;
                }
            }
            // this.cdRef.markForCheck();
        });

        this.clickTabViewBy('cStatus');
        // this.initForm();
    }

    onSelectedTab(event): void {
        this.selectTab = event.index;

        let items = JSON.parse(localStorage.getItem('item'));
        items = {
            ...items,
            approvalStatus: event.index,
        };
        localStorage.setItem('item', JSON.stringify(items));
    }

    getDataTab(index): void {
        let parameter = {};
        parameter['type'] = index;
        this.CollectionStore.dispatch(
            CollectionActions.fetchCalculateCollectionStatusRequest({
                payload: parameter,
            })
        );

        this.isLoading$ = this.CollectionStore.select(CollectionSelectors.getLoadingState);

        // this.initForm();

        let getDetail = JSON.parse(localStorage.getItem('item'));
        if (getDetail) {
            this.selectTab = getDetail['approvalStatus'];
            this.searchByValue = getDetail['searchBy'];
            this.search = getDetail['keyword'];
            this.form.get('searchValue').setValue(this.search);
        }
    }

    initForm() {
        this.form = this.fb.group({
            searchValue: '',
        });
    }

    ngOnDestroy(): void {
        this.subs$.next();
        this.subs$.complete();
        if (this.subsData) {
            this.subsData.unsubscribe();
        }
        this.fuseNavigation$.unregister('customNavigation');
        // localStorage.removeItem('item');
    }
}
