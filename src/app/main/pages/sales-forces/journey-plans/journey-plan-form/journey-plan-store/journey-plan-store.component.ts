import {
    ChangeDetectionStrategy,
    Component,
    OnInit,
    ViewEncapsulation,
    Input
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { Store } from '@ngrx/store';
import { LifecyclePlatform } from 'app/shared/models';

import { locale as english } from '../../i18n/en';
import { locale as indonesian } from '../../i18n/id';
import * as fromJourneyPlans from '../../store/reducers';

@Component({
    selector: 'app-journey-plan-store',
    templateUrl: './journey-plan-store.component.html',
    styleUrls: ['./journey-plan-store.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class JourneyPlanStoreComponent implements OnInit {
    form: FormGroup;

    @Input() readonly pageType: 'new' | 'edit' = 'new';

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private store: Store<fromJourneyPlans.FeatureState>,
        private _fuseTranslationLoaderService: FuseTranslationLoaderService
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.

        this._initPage();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    private _initPage(lifeCycle?: LifecyclePlatform): void {
        switch (lifeCycle) {
            case LifecyclePlatform.OnDestroy:
                break;

            default:
                // Load translate
                this._fuseTranslationLoaderService.loadTranslations(indonesian, english);

                this._initForm();
                break;
        }
    }

    private _initForm(): void {
        if (this.pageType === 'new') {
            this.form = this.formBuilder.group({
                startDate: '',
                endDate: '',
                portfolio: ''
            });
        }
    }
}
