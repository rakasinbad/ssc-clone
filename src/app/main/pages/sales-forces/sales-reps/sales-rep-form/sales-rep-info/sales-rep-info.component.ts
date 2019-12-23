import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { Store } from '@ngrx/store';

import { locale as english } from '../../i18n/en';
import { locale as indonesian } from '../../i18n/id';
import * as fromSalesReps from '../../store/reducers';
import { LifecycleHooks } from '@angular/compiler/src/lifecycle_reflector';

@Component({
    selector: 'app-sales-rep-info',
    templateUrl: './sales-rep-info.component.html',
    styleUrls: ['./sales-rep-info.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SalesRepInfoComponent implements OnInit {
    form: FormGroup;
    pageType: string;

    constructor(
        private formBuilder: FormBuilder,
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

        this._initForm();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    /**
     *
     * Initialize current page
     * @private
     * @param {LifecycleHooks} [lifeCycle]
     * @memberof SalesRepInfoComponent
     */
    private _initPage(lifeCycle?: LifecycleHooks): void {
        const { id } = this.route.snapshot.params;

        if (id === 'new') {
            this.pageType = 'new';
        } else {
            this.pageType = 'edit';
        }
    }

    /**
     *
     * Initialize form
     * @private
     * @memberof SalesRepInfoComponent
     */
    private _initForm(): void {
        this.form = this.formBuilder.group({
            name: '',
            phone: '',
            nik: '',
            area: '',
            status: ''
        });
    }
}
