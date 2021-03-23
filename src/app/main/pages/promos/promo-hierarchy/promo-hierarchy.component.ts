import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Store as NgRxStore } from '@ngrx/store';
import { FuseNavigationService } from '@fuse/components/navigation/navigation.service';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { Observable, Subject } from 'rxjs';
import { ICardHeaderConfiguration } from 'app/shared/components/card-header/models';
import { UiActions } from 'app/shared/store/actions';
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
    selectedViewBy: string = 'all';
    labelInfo: string = '';

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
                { id: 'all', label: 'All' },
                { id: 'flexi', label: 'Flexi Combo' },
                { id: 'cross', label: 'Cross Selling Promo' },
                { id: 'voucher', label: 'Supplier Voucher' }
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
            case 'all':
                this.selectedViewBy = action;
                break;
            case 'flexi':
                this.selectedViewBy = action;
            case 'cross':
                this.selectedViewBy = action;
                break;
            case 'voucher':
                this.selectedViewBy = action;
                break;
    
            default:
                return;
        }
    }

    onSelectedTab(index: number): void {
        switch (index) {
            case 0:
                this.section = 'layer0';
                this.labelInfo = "Layer 00: Promos in this layer will run first";
                break;
            case 1:
                this.section = 'layer1';
                this.labelInfo = "Layer 01: This layer is recommended for promo that flagged as “Principal Promo”";
                break;
            case 2:
                this.section = 'layer2';
                this.labelInfo = "Layer 02: This layer is recommended for promo that flagged as “Distributor Promo”";
                break;
            case 3:
                this.section = 'layer3';
                this.labelInfo = "Layer 03: This layer is recommended for promo that flagged as “Sinbad Promo”";
                break;
            case 4:
                this.section = 'layer4';
                this.labelInfo = "Layer 04: This layer is recommended for promo that flagged as “Payment Method Promo”";
                break;
        }
    }

    ngOnInit(): void {
      
    }

    ngOnDestroy(): void {
        this.subs$.next();
        this.subs$.complete();
        this.fuseNavigation$.unregister('customNavigation');
    }
}
