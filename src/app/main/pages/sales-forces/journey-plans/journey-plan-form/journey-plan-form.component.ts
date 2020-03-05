import {
    ChangeDetectionStrategy,
    Component,
    OnInit,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { MatTabGroup } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { Store } from '@ngrx/store';
import { IBreadcrumbs, LifecyclePlatform } from 'app/shared/models/global.model';
import { UiActions } from 'app/shared/store/actions';

import { locale as english } from '../i18n/en';
import { locale as indonesian } from '../i18n/id';
import * as fromJourneyPlans from '../store/reducers';

@Component({
    selector: 'app-journey-form',
    templateUrl: './journey-plan-form.component.html',
    styleUrls: ['./journey-plan-form.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class JourneyPlanFormComponent implements OnInit {
    pageType: string;

    private _breadCrumbs: Array<IBreadcrumbs> = [
        {
            title: 'Home'
        },
        {
            title: 'Sales Management'
        },
        {
            title: 'New Journey Plan'
        }
    ];

    @ViewChild(MatTabGroup, { static: true }) tabGroup: MatTabGroup;

    constructor(
        private route: ActivatedRoute,
        private store: Store<fromJourneyPlans.FeatureState>,
        private _fuseTranslationLoaderService: FuseTranslationLoaderService
    ) {}

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.

        this._initPage();
    }

    private _initPage(lifeCycle?: LifecyclePlatform): void {
        const { id } = this.route.snapshot.params;

        if (id === 'new') {
            this.pageType = 'new';
        } else {
            this.pageType = 'edit';

            this._breadCrumbs = [
                {
                    title: 'Home'
                },
                {
                    title: 'Sales Management'
                },
                {
                    title: 'Edit Journey Plan'
                }
            ];
        }

        // Set breadcrumbs
        this.store.dispatch(
            UiActions.createBreadcrumb({
                payload: this._breadCrumbs
            })
        );

        switch (lifeCycle) {
            case LifecyclePlatform.OnDestroy:
                break;

            default:
                // Load translate
                this._fuseTranslationLoaderService.loadTranslations(indonesian, english);

                this.tabGroup.selectedIndex = 2;
                break;
        }
    }
}
