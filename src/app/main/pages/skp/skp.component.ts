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

import { SkpActions } from './store/actions';
import * as fromSkp from './store/reducers';

@Component({
    selector: 'app-skp',
    templateUrl: './skp.component.html',
    styleUrls: ['./skp.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkpComponent implements OnInit, OnDestroy {
       // Untuk penanda tab mana yang sedang aktif.
       section: 'all' | 'active' | 'inactive' = 'all';

    // Untuk menentukan konfigurasi card header.
    cardHeaderConfig: ICardHeaderConfiguration = {
        title: {
            label: 'Surat Kerjasama Promosi',
        },
        search: {
            active: true,
        },
        add: {
            label: 'Create',
            permissions: [],
        }
    };

    keyword = '';

    private breadCrumbs: IBreadcrumbs[] = [
        {
            title: 'Home',
        },
        {
            title: 'Surat Kerjasama Promosi',
            active: true,
        },
    ];

    private unSubs$: Subject<void> = new Subject<void>();

    constructor(private router: Router, private store: Store<fromSkp.FeatureState> ) {}

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
        this.router.navigateByUrl('/pages/skp/create');
    }

    onSelectedTab(index: number): void {
        switch (index) {
            case 0:
                this.section = 'all';
                break;
            case 1:
                this.section = 'active';
                break;
            case 2:
                this.section = 'inactive';
                break;
        }
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    private _initPage(lifeCycle?: LifecyclePlatform): void {
        switch (lifeCycle) {
            case LifecyclePlatform.OnDestroy:
                // Reset breadcrumb state
                this.store.dispatch(UiActions.resetBreadcrumb());

                // Reset core state skpCombos
                this.store.dispatch(SkpActions.clearState());
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
