import {
    Component,
    OnInit,
    ChangeDetectionStrategy,
    ViewEncapsulation,
    OnDestroy,
    AfterViewInit
} from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';
import { ActivatedRoute } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { PageEvent } from '@angular/material';
// NgRx's Libraries
import { Store } from '@ngrx/store';
import { IBreadcrumbs, LifecyclePlatform } from 'app/shared/models';
import { UiSelectors } from 'app/shared/store/selectors';
import { UiActions } from 'app/shared/store/actions';
// RxJS' Libraries
import { Observable, Subject } from 'rxjs';
// Environment variables.
// Entity model.
// State management's stuffs.
import * as fromAssociations from './store/reducers';
import { AssociationActions } from './store/actions';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
    selector: 'app-associations',
    templateUrl: './associations.component.html',
    styleUrls: ['./associations.component.scss'],
    animations: [
        fuseAnimations,
        trigger('enterAnimation', [
            transition(':enter', [
                style({ transform: 'translateX(100%)', opacity: 0 }),
                animate('500ms', style({ transform: 'translateX(0)', opacity: 1 }))
            ]),
            transition(':leave', [
                style({ transform: 'translateX(0)', opacity: 1 }),
                animate('500ms', style({ transform: 'translateX(100%)', opacity: 0 }))
            ])
        ])
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AssociationsComponent implements OnInit, OnDestroy, AfterViewInit {
    private _unSubs$: Subject<void>;

    buttonViewByActive$: Observable<string>;

    private readonly _breadCrumbs: IBreadcrumbs[] = [
        {
            title: 'Home'
        },
        {
            title: 'Sales Rep Management'
        },
        {
            title: 'Association'
        }
    ];

    constructor(
        private route: ActivatedRoute,
        private readonly sanitizer: DomSanitizer,
        private store: Store<fromAssociations.FeatureState>,
        private _fuseTranslationLoaderService: FuseTranslationLoaderService
    ) {}

    /**
     * PRIVATE FUNCTIONS
     */

    /**
     * PUBLIC FUNCTIONS
     */

    onChangePage($event: PageEvent): void {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.
        this._unSubs$ = new Subject();

        this.buttonViewByActive$ = this.store.select(UiSelectors.getCustomToolbarActive);
    }

    ngAfterViewInit(): void {
        // Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
        // Add 'implements AfterViewInit' to the class
    }

    ngOnDestroy(): void {
        // Called once, before the instance is destroyed.
        // Add 'implements OnDestroy' to the class.

        // Reset core state sales reps
        this.store.dispatch(AssociationActions.clearState());

        this._unSubs$.next();
        this._unSubs$.complete();
    }

    /**
     *
     * Initialize current page
     * @private
     * @param {LifecyclePlatform} [lifeCycle]
     * @memberof AssociationsComponent
     */
    private _initPage(lifeCycle?: LifecyclePlatform): void {
        // Set breadcrumbs
        this.store.dispatch(
            UiActions.createBreadcrumb({
                payload: this._breadCrumbs
            })
        );
    }
}
