import {
    ChangeDetectionStrategy,
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import { Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { Store } from '@ngrx/store';
import { ICardHeaderConfiguration } from 'app/shared/components/card-header/models';
import { IBreadcrumbs, LifecyclePlatform } from 'app/shared/models/global.model';
import { UiActions } from 'app/shared/store/actions';
import { Subject } from 'rxjs';

import { FlexiComboActions } from './store/actions';
import * as fromFlexiCombo from './store/reducers';

@Component({
    selector: 'app-flexi-combo',
    templateUrl: './flexi-combo.component.html',
    styleUrls: ['./flexi-combo.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlexiComboComponent implements OnInit, OnDestroy {
    // Untuk menentukan konfigurasi card header.
    cardHeaderConfig: ICardHeaderConfiguration = {
        title: {
            label: 'Flexi Combo',
        },
        search: {
            active: true,
        },
        add: {
            permissions: [],
        },
        // export: {
        //     permissions: [],
        //     useAdvanced: true,
        //     pageType: '',
        // },
        // import: {
        //     permissions: [],
        //     useAdvanced: true,
        //     pageType: '',
        // },
    };

    keyword = '';

    private breadCrumbs: IBreadcrumbs[] = [
        {
            title: 'Home',
        },
        {
            title: 'Promo',
        },
        {
            title: 'Flexi Combo',
            active: true,
        },
    ];

    private unSubs$: Subject<void> = new Subject<void>();

    constructor(private router: Router, private store: Store<fromFlexiCombo.FeatureState>) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.

        this._initPage();
    }

    ngOnDestroy(): void {
        // Called once, before the instance is destroyed.
        // Add 'implements OnDestroy' to the class.

        this._initPage(LifecyclePlatform.OnDestroy);
    }

    onClickAdd(): void {
        this.router.navigateByUrl('/pages/promos/flexi-combo/new');
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    private _initPage(lifeCycle?: LifecyclePlatform): void {
        switch (lifeCycle) {
            case LifecyclePlatform.OnDestroy:
                // Reset breadcrumb state
                this.store.dispatch(UiActions.resetBreadcrumb());

                // Reset core state flexiCombos
                this.store.dispatch(FlexiComboActions.clearState());
                break;

            default:
                // Set breadcrumbs
                this.store.dispatch(
                    UiActions.createBreadcrumb({
                        payload: this.breadCrumbs,
                    })
                );
                break;
        }
    }
}
