import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { Store } from '@ngrx/store';
import { IBreadcrumbs, IFooterActionConfig, LifecyclePlatform } from 'app/shared/models';
import { FormActions, UiActions } from 'app/shared/store/actions';
import { Observable } from 'rxjs';

import { locale as english } from '../i18n/en';
import { locale as indonesian } from '../i18n/id';
import { SalesRep } from '../models';
import { SalesRepActions } from '../store/actions';
import * as fromSalesReps from '../store/reducers';
import { SalesRepSelectors } from '../store/selectors';

@Component({
    selector: 'app-sales-rep-form',
    templateUrl: './sales-rep-form.component.html',
    styleUrls: ['./sales-rep-form.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SalesRepFormComponent implements OnInit, AfterViewInit, OnDestroy {
    // form: FormGroup;
    pageType: string;
    fullName: string;

    salesRep$: Observable<SalesRep>;

    private _breadCrumbs: Array<IBreadcrumbs> = [
        {
            title: 'Home'
        },
        {
            title: 'Sales Rep Management'
        },
        {
            title: 'New Sales Rep'
        }
    ];

    private _footerConfig: IFooterActionConfig = {
        progress: {
            title: {
                label: 'Skor tambah toko',
                active: true
            },
            value: {
                active: true
            },
            active: false
        },
        action: {
            save: {
                label: 'Save',
                active: true
            },
            draft: {
                label: 'Save Draft',
                active: false
            },
            cancel: {
                label: 'Cancel',
                active: false
            }
            // goBack: {
            //     label: 'Kembali',
            //     active: true,
            //     url: '/pages/account/stores'
            // }
        }
    };

    constructor(
        private route: ActivatedRoute,
        private store: Store<fromSalesReps.FeatureState>,
        private _fuseTranslationLoaderService: FuseTranslationLoaderService
    ) {
        // Load translate
        this._fuseTranslationLoaderService.loadTranslations(indonesian, english);
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.

        this._initPage();
    }

    ngAfterViewInit(): void {
        // Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
        // Add 'implements AfterViewInit' to the class.

        this._initPage(LifecyclePlatform.AfterViewInit);
    }

    ngOnDestroy(): void {
        // Called once, before the instance is destroyed.
        // Add 'implements OnDestroy' to the class.

        this._initPage(LifecyclePlatform.OnDestroy);
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    /**
     *
     * Initialize current page
     * @private
     * @param {LifecyclePlatform} [lifeCycle]
     * @memberof SalesRepFormComponent
     */
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
                    title: 'Sales Rep Management'
                },
                {
                    title: 'Edit Sales Rep'
                }
            ];
        }

        // Set breadcrumbs
        this.store.dispatch(
            UiActions.createBreadcrumb({
                payload: this._breadCrumbs
            })
        );

        // Set footer action
        this.store.dispatch(UiActions.setFooterActionConfig({ payload: this._footerConfig }));

        switch (lifeCycle) {
            case LifecyclePlatform.AfterViewInit:
                // Display footer action
                this.store.dispatch(UiActions.showFooterAction());
                break;

            case LifecyclePlatform.OnDestroy:
                // Hide footer action
                this.store.dispatch(UiActions.hideFooterAction());

                // Reset breadcrumb state
                this.store.dispatch(UiActions.resetBreadcrumb());

                // Reset click save button state
                this.store.dispatch(FormActions.resetClickSaveButton());

                // Reset core state sales reps
                this.store.dispatch(SalesRepActions.clearState());
                break;

            default:
                if (this.pageType === 'edit') {
                    this.salesRep$ = this.store.select(SalesRepSelectors.getSelectedItem);

                    this.store.dispatch(SalesRepActions.fetchSalesRepRequest({ payload: id }));
                }
                break;
        }
    }
}
