import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { fuseAnimations } from '@fuse/animations';
import { FuseNavigationService } from '@fuse/components/navigation/navigation.service';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { GeneratorService } from 'app/shared/helpers';
import { UiActions } from 'app/shared/store/actions';
import { merge, Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { locale as english } from '../i18n/en';
import { locale as indonesian } from '../i18n/id';
import { statusCatalogue } from '../status';
import { fromCatalogue } from '../store/reducers';
import { CatalogueSelectors } from '../store/selectors';
import { ICatalogueDemo } from '../models';
import { MatTableDataSource } from '@angular/material';

@Component({
  selector: 'app-catalogues-add-new-product',
  templateUrl: './catalogues-add-new-product.component.html',
  styleUrls: ['./catalogues-add-new-product.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CataloguesAddNewProductComponent implements OnInit {

  constructor(
    private store: Store<fromCatalogue.FeatureState>,
    private _fuseNavigationService: FuseNavigationService,
    private _fuseTranslationLoaderService: FuseTranslationLoaderService,
    public translate: TranslateService
  ) {
    this.store.dispatch(
        UiActions.createBreadcrumb({
            payload: [
                {
                    title: 'Home',
                    translate: 'BREADCRUMBS.HOME'
                },
                {
                    title: 'Catalogue',
                    translate: 'BREADCRUMBS.CATALOGUE'
                },
                {
                    title: 'Add Product',
                    translate: 'BREADCRUMBS.ADD_PRODUCT',
                    active: true
                }
            ]
        })
    );
  }

  ngOnInit() {
  }

}
