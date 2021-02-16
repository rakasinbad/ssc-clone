import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { Store as NgRxStore } from '@ngrx/store';
import { environment } from 'environments/environment';
import { fuseAnimations } from '@fuse/animations';
import { FuseNavigationService } from '@fuse/components/navigation/navigation.service';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { Observable, Subject } from 'rxjs';
import { ICardHeaderConfiguration } from 'app/shared/components/card-header/models';
import { UiActions } from 'app/shared/store/actions';
import { UiSelectors } from 'app/shared/store/selectors';
import { IQueryParams } from 'app/shared/models/query.model';
import { locale as english } from './i18n/en';
import { locale as indonesian } from './i18n/id';
import { FeatureState as PromoHierarchyCoreState } from './store/reducers';

@Component({
  selector: 'app-promo-hierarchy',
  templateUrl: './promo-hierarchy.component.html',
  styleUrls: ['./promo-hierarchy.component.scss']
})
export class PromoHierarchyComponent implements OnInit, OnDestroy {
    // Untuk penanda tab mana yang sedang aktif.
    section: 'layer0' | 'layer1' | 'layer2' | 'layer3' | 'layer4' = 'layer0';

    // tslint:disable-next-line: no-inferrable-types
    search: string = '';
    selectedViewBy: string = 'all-hierarchy';

    // Untuk menentukan konfigurasi card header.
    cardHeaderConfig: ICardHeaderConfiguration = {
        title: {
            label: 'Promo Hierarchy',
        },
        search: {
            active: true,
            changed: (value: string) => {
                this.search = value;
            },
        },
        viewBy: {
            list: [
                { id: 'all-hierarchy', label: 'All' },
                { id: 'flexi-hierarchy', label: 'Flexi Combo' },
                { id: 'cross-hierarchy', label: 'Cross Selling Promo' },
                { id: 'voucher-hierarchy', label: 'SupplierVoucher' }
            ],
            onChanged: (value: { id: string; label: string }) => this.clickTabViewBy(value.id)
        },
       
    };

    // Untuk menangkap status loading dari state.
    isLoading$: Observable<boolean>;

    // Untuk keperluan unsubscribe.
    private subs$: Subject<void> = new Subject<void>();

    constructor(
        private PromoHierarchyStore: NgRxStore<PromoHierarchyCoreState>,
        private fuseNavigation$: FuseNavigationService,
        private fuseTranslationLoader$: FuseTranslationLoaderService,
        private router: Router
    ) {
        // Memuat terjemahan.
        this.fuseTranslationLoader$.loadTranslations(indonesian, english);

        // Memuat breadcrumb.
        this.PromoHierarchyStore.dispatch(
            UiActions.createBreadcrumb({
                payload: [
                    {
                        title: 'Home',
                    },
                    {
                        title: 'Promo',
                    },
                    {
                        title: 'Promo Hierarchy',
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
            case 'all-hierarchy':
                this.selectedViewBy = action;

                // this.SkuAssignmentsStore.dispatch(
                //     UiActions.setCustomToolbarActive({ payload: 'sku-assignment-warehouse' })
                // );
                break;
            case 'flexi-hierarchy':
                this.selectedViewBy = action;

                // this.SkuAssignmentsStore.dispatch(
                //     UiActions.setCustomToolbarActive({ payload: 'sku-assignment-sku' })
                // );
                break;
            case 'cross-hierarchy':
                    this.selectedViewBy = action;
    
                    // this.SkuAssignmentsStore.dispatch(
                    //     UiActions.setCustomToolbarActive({ payload: 'sku-assignment-sku' })
                    // );
                break;
            case 'voucher-hierarchy':
                    this.selectedViewBy = action;
    
                    // this.SkuAssignmentsStore.dispatch(
                    //     UiActions.setCustomToolbarActive({ payload: 'sku-assignment-sku' })
                    // );
                break;
    
            default:
                return;
        }
    }

    onSelectedTab(index: number): void {
        switch (index) {
            case 0:
                this.section = 'layer0';
                break;
            case 1:
                this.section = 'layer1';
                break;
            case 2:
                this.section = 'layer2';
                break;
            case 3:
                this.section = 'layer3';
                break;
            case 4:
                this.section = 'layer4';
                break;
        }
    }

    ngOnInit(): void {
        // this.buttonViewByActive$ = this.SkuAssignmentsStore.select(
        //     UiSelectors.getCustomToolbarActive
        // );
    }

    ngOnDestroy(): void {
        this.subs$.next();
        this.subs$.complete();

        // this.SkuAssignmentsStore.dispatch(UiActions.hideCustomToolbar());
        // this.SkuAssignmentsStore.dispatch(UiActions.createBreadcrumb({ payload: null }));
        this.fuseNavigation$.unregister('customNavigation');
    }
}
