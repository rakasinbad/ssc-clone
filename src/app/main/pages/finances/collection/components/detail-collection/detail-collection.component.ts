import {
    ChangeDetectionStrategy,
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { Store } from '@ngrx/store';
import { IBreadcrumbs, LifecyclePlatform } from 'app/shared/models/global.model';
import { UiActions } from 'app/shared/store/actions';
import { Observable } from 'rxjs';

import { locale as english } from '../../i18n/en';
import { locale as indonesian } from '../../i18n/id';
import { FinanceDetailCollection } from '../../models';
import { CollectionActions } from '../../store/actions';
import * as collectionStatus from '../../store/reducers';
import { CollectionSelectors } from '../../store/selectors';
import { IQueryParams } from 'app/shared/models/query.model';
import { Router } from '@angular/router';

@Component({
    selector: 'app-detail-collection',
    templateUrl: './detail-collection.component.html',
    styleUrls: ['./detail-collection.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.Default,
})
export class DetailCollectionComponent implements OnInit {
    public dataDetail: any;

    private _breadCrumbs: IBreadcrumbs[] = [
        {
            title: 'Home',
        },
        {
            title: 'Finance',
        },
        {
            title: 'Collection',
        },
        {
            title: 'Collection Details',
            active: true,
        },
    ];

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private store: Store<collectionStatus.FeatureState>,
        private _fuseTranslationLoaderService: FuseTranslationLoaderService
    ) {
        // Load translate
        this._fuseTranslationLoaderService.loadTranslations(indonesian, english);
    }

    ngOnInit() {
      // Set breadcrumbs
      this.store.dispatch(
        UiActions.createBreadcrumb({
            payload: this._breadCrumbs,
        })
    );
    }

    onClickBack(): void {
        this.router.navigateByUrl('/pages/finances/collection');
        localStorage.clear();
    }
}
