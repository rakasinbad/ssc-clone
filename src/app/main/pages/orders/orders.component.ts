import {
    ChangeDetectionStrategy,
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation
} from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { FuseNavigationService } from '@fuse/components/navigation/navigation.service';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { Store } from '@ngrx/store';
import { UiActions } from 'app/shared/store/actions';
import * as fromRoot from 'app/store/app.reducer';

import { locale as english } from './i18n/en';
import { locale as indonesian } from './i18n/id';
import { statusOrder } from './status';

@Component({
    selector: 'app-orders',
    templateUrl: './orders.component.html',
    styleUrls: ['./orders.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrdersComponent implements OnInit, OnDestroy {
    statusOrder: any;

    constructor(
        private store: Store<fromRoot.State>,
        private _fuseNavigationService: FuseNavigationService,
        private _fuseTranslationLoaderService: FuseTranslationLoaderService
    ) {
        this.statusOrder = statusOrder;

        this._fuseNavigationService.register('customNavigation', this.statusOrder);

        this._fuseTranslationLoaderService.loadTranslations(indonesian, english);
    }
    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.

        this.store.dispatch(UiActions.showCustomToolbar());
    }

    ngOnDestroy(): void {
        // Called once, before the instance is destroyed.
        // Add 'implements OnDestroy' to the class.

        this.store.dispatch(UiActions.hideCustomToolbar());
    }
}
