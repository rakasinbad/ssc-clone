import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Store as NgRxStore } from '@ngrx/store';
import { FuseNavigationService } from '@fuse/components/navigation/navigation.service';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { Observable, Subject } from 'rxjs';
import { ICardHeaderConfiguration } from 'app/shared/components/card-header/models';
import { UiActions } from 'app/shared/store/actions';
import { locale as english } from './i18n/en';
import { locale as indonesian } from './i18n/id';
import { FeatureState as CollectionCoreState } from './store/reducers';

@Component({
  selector: 'app-collection',
  templateUrl: './collection.component.html',
  styleUrls: ['./collection.component.scss']
})
export class CollectionComponent implements OnInit, OnDestroy {
  // Untuk penanda tab mana yang sedang aktif.
  // section: 'layer0' | 'layer1' | 'layer2' | 'layer3' | 'layer4' = 'layer0';

  // tslint:disable-next-line: no-inferrable-types
  search: string = '';
  selectedViewBy: string = 'cStatus';
  labelInfo: string = '';
  isHidden: boolean = false;
  allPayment: number = 2;
  waitingApproval: number = 1;
  approvedCollection: number = 1;
  rejectedCollection: number = 1;

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
          onChanged: (value: { id: string; label: string }) => this.clickTabViewBy(value.id)
      },
     
  };

  // Untuk menangkap status loading dari state.
  isLoading$: Observable<boolean>;

  // Untuk keperluan unsubscribe.
  private subs$: Subject<void> = new Subject<void>();

  constructor(
      private CollectionStore: NgRxStore<CollectionCoreState>,
      private fuseNavigation$: FuseNavigationService,
      private fuseTranslationLoader$: FuseTranslationLoaderService,
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
              break;
          case 'bStatus':
              this.selectedViewBy = action;
          default:
              return;
      }
  }

  onSelectedTab(index): void {
      console.log(index);
  }

  // onSelectedTab(index: number): void {
  //     switch (index) {
  //         case 0:
  //             this.isHidden = false;
  //             this.section = 'layer0';
  //             this.labelInfo = "Layer 00: Promos in this layer will run first";
  //             break;
  //         case 1:
  //             this.isHidden = false;
  //             this.section = 'layer1';
  //             this.labelInfo = "Layer 01: This layer is recommended for promo that flagged as “Principal Promo”";
  //             break;
  //         case 2:
  //             this.isHidden = false;
  //             this.labelInfo = "Layer 02: This layer is recommended for promo that flagged as “Distributor Promo”";
  //             break;
  //         case 3:
  //             this.isHidden = true;
  //             break;
  //         case 4:
  //             this.isHidden = true;
  //             break;
  //         default:
  //             this.labelInfo = "Layer 00: Promos in this layer will run first";
  //             break;
  //     }
  // }

  ngOnInit(): void {
    // this.onSelectedTab(0);
  }

  ngOnDestroy(): void {
      this.subs$.next();
      this.subs$.complete();
      this.fuseNavigation$.unregister('customNavigation');
  }
}
