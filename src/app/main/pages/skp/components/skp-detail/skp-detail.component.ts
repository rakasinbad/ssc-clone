import {
    ChangeDetectionStrategy,
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { Store } from '@ngrx/store';
import { IBreadcrumbs, LifecyclePlatform } from 'app/shared/models/global.model';
import { UiActions } from 'app/shared/store/actions';
import { Observable } from 'rxjs';

import { locale as english } from '../../i18n/en';
import { locale as indonesian } from '../../i18n/id';
import { CreateSkpDto, SkpModel, UpdateSkpDto } from '../../models';
import { SkpActions } from '../../store/actions';
import * as fromSkp from '../../store/reducers';
import { SkpSelectors } from '../../store/selectors';
import { IQueryParams } from 'app/shared/models/query.model';
import { MatTabChangeEvent } from '@angular/material';
import { map, takeUntil } from 'rxjs/operators';
import * as _ from 'lodash';

// import { FlexiCombo } from '../../models';
// import { FlexiComboActions } from '../../store/actions';
// import * as fromFlexiCombos from '../../store/reducers';
// import { FlexiComboSelectors } from '../../store/selectors';

@Component({
    selector: 'app-skp-detail',
    templateUrl: './skp-detail.component.html',
    styleUrls: ['./skp-detail.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkpDetailComponent implements OnInit, OnDestroy {
    SkpModel$: Observable<SkpModel>;
    isLoading$: Observable<boolean>;
    public tabActive: boolean = true;
    public titleName: string = '';
    idDetail: Number;
    private _breadCrumbs: IBreadcrumbs[] = [
        {
            title: 'Home',
        },
        {
            title: 'Surat Kerjasama Promosi',
        },
        {
            title: 'Surat Kerjasama Promosi Detail',
            active: true,
        },
    ];

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private store: Store<fromSkp.FeatureState>,
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

    ngOnDestroy(): void {
        // Called once, before the instance is destroyed.
        // Add 'implements OnDestroy' to the class.

        this._initPage(LifecyclePlatform.OnDestroy);
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    private _initPage(lifeCycle?: LifecyclePlatform): void {
        const { id } = this.route.snapshot.params;
        this.idDetail = id;
        switch (lifeCycle) {
            case LifecyclePlatform.OnDestroy:
                // Reset breadcrumb state
                this.store.dispatch(UiActions.resetBreadcrumb());

                // Reset core state SkpActions
                this.store.dispatch(SkpActions.clearState());
                break;

            default:
                const parameter: IQueryParams = {};
                parameter['splitRequest'] = true;
                // Set breadcrumbs
                this.store.dispatch(
                    UiActions.createBreadcrumb({
                        payload: this._breadCrumbs,
                    })
                );
                
                this.SkpModel$ = this.store.select(SkpSelectors.getSelectedItem);
        
                this.store.dispatch(SkpActions.fetchSkpRequest({ payload: { id, parameter } }));
                this.isLoading$ = this.store.select(SkpSelectors.getIsLoading);

                break;
        }
    }

    onEditSkp(): void {
        this.router.navigateByUrl('/pages/skp/' + this.idDetail);
    }

    clickDetail(event: MatTabChangeEvent): void {
        if (event.index == 1 || event.index == 2) {
            this.tabActive = false;
            // this._initPage();

        } else {
            this.tabActive = true;
            this._initPage();

        }
    }
}
