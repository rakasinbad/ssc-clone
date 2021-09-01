import {
    Component,
    OnInit,
    ChangeDetectionStrategy,
    OnDestroy,
    ChangeDetectorRef,
    ViewEncapsulation,
} from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { Store } from '@ngrx/store';
import { IBreadcrumbs, LifecyclePlatform } from 'app/shared/models/global.model';
import { UiActions } from 'app/shared/store/actions';
import { Observable } from 'rxjs';

import { locale as english } from '../../../i18n/en';
import { locale as indonesian } from '../../../i18n/id';
import { FinanceDetailCollection } from '../../../models';
import { CollectionActions } from '../../../store/actions';
import * as collectionStatus from '../../../store/reducers';
import { CollectionSelectors } from '../../../store/selectors';
import { IQueryParams } from 'app/shared/models/query.model';
import { Router } from '@angular/router';

@Component({
    selector: 'app-detail-collection-info',
    templateUrl: './detail-collection-info.component.html',
    styleUrls: ['./detail-collection-info.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailCollectionInfoComponent implements OnInit, OnDestroy {
    constructor() {}

    ngOnInit() {}

    ngOnDestroy(): void {
  }
}
