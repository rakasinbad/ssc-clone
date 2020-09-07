import { animate, style, transition, trigger } from '@angular/animations';
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation,
    ChangeDetectorRef
} from '@angular/core';
import { PageEvent } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { Store } from '@ngrx/store';
import { ICardHeaderConfiguration } from 'app/shared/components/card-header/models';
import { IBreadcrumbs, LifecyclePlatform } from 'app/shared/models/global.model';
import { UiActions } from 'app/shared/store/actions';
import { UiSelectors } from 'app/shared/store/selectors';
import { NgxPermissionsService } from 'ngx-permissions';
import { Observable, Subject } from 'rxjs';

import { locale as english } from './i18n/en';
import { locale as indonesian } from './i18n/id';
import { AssociationActions } from './store/actions';
import * as fromAssociations from './store/reducers';
import { AssociationService, AssociationViewBy } from './services';
import { takeUntil } from 'rxjs/operators';

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
    // changeDetection: ChangeDetectionStrategy.OnPush
})
export class AssociationsComponent implements OnInit, OnDestroy, AfterViewInit {
    // Untuk menyimpan View By yang terpilih.
    // tslint:disable-next-line: no-inferrable-types
    selectedViewBy: string = 'store';
    // Untuk menentukan konfigurasi card header.
    cardHeaderConfig: ICardHeaderConfiguration = {
        title: {
            label: 'SR Assignment'
        },
        search: {
            active: false,
            changed: (value: string) =>
                this.associationService.setSearchValue(value)
        },
        viewBy: {
            list: [
                {
                    id: 'store',
                    label: 'Store'
                },
                {
                    id: 'sales-rep',
                    label: 'Sales Rep'
                },
                {
                    id: 'portfolio',
                    label: 'Portfolio'
                }
            ],
            onChanged: ({ id }: { id: string }) => {
                this.associationService.selectViewBy(id as AssociationViewBy);
                this.associationService.selectTab('all');
            }
        },
        add: {
            permissions: ['SRM.ASC.CREATE'],
            onClick: () => this.router.navigate(['/pages/sales-force/associations/add'])
        }
        // export: {
        //     permissions: ['SRM.ASC.EXPORT'],
        //     useAdvanced: true,
        //     pageType: 'sr-assignment'
        // },
        // import: {
        //     permissions: ['SRM.ASC.IMPORT'],
        //     useAdvanced: true,
        //     pageType: 'sr-assignment'
        // }
    };

    private _unSubs$: Subject<void>;

    private readonly _breadCrumbs: IBreadcrumbs[] = [
        {
            title: 'Home'
        },
        {
            title: 'Sales Management'
        },
        {
            title: 'SR Assignment',
            keepCase: true
        }
    ];

    constructor(
        private router: Router,
        // private readonly sanitizer: DomSanitizer,
        private store: Store<fromAssociations.FeatureState>,
        private associationService: AssociationService,
        // private ngxPermissionsService: NgxPermissionsService,
        private _fuseTranslationLoaderService: FuseTranslationLoaderService,
        private cdRef: ChangeDetectorRef,
    ) {
        // Load translate
        this._fuseTranslationLoaderService.loadTranslations(indonesian, english);
    }

    /**
     * PRIVATE FUNCTIONS
     */

    /**
     * PUBLIC FUNCTIONS
     */

    onChangePage($event: PageEvent): void {}

    onSelectedTab(idx: number): void {
        if (this.selectedViewBy === 'store') {
            if (idx === 0) {
                this.associationService.selectTab('all');
            } else if (idx === 1) {
                this.associationService.selectTab('store-assigned-to-sr-in-portfolio');
            } else if (idx === 2) {
                this.associationService.selectTab('store-assigned-to-sr-out-of-portfolio');
            } else if (idx === 3) {
                this.associationService.selectTab('store-not-assigned-to-sr-in-portfolio');
            } else if (idx === 4) {
                this.associationService.selectTab('store-not-assigned-to-sr-out-of-portfolio');
            }
        } else if (this.selectedViewBy === 'sales-rep') {
            if (idx === 0) {
                this.associationService.selectTab('all');
            } else if (idx === 1) {
                this.associationService.selectTab('sales-rep-with-assignment');
            } else if (idx === 2) {
                this.associationService.selectTab('sales-rep-without-assignment');
            }
        } else if (this.selectedViewBy === 'portfolio') {
            if (idx === 0) {
                this.associationService.selectTab('all');
            } else if (idx === 1) {
                this.associationService.selectTab('portfolio-assigned-to-sr');
            } else if (idx === 2) {
                this.associationService.selectTab('portfolio-not-assigned-to-sr');
            }
        }
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.
        this._unSubs$ = new Subject();

        this._initPage();
    }

    ngAfterViewInit(): void {
        // Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
        // Add 'implements AfterViewInit' to the class
        this.associationService.getSelectedViewBy().pipe(
            takeUntil(this._unSubs$)
        ).subscribe(value => {
            this.selectedViewBy = value;
            this.cdRef.detectChanges();
        });

        setTimeout(() => this.associationService.selectViewBy('store'), 200);
    }

    ngOnDestroy(): void {
        // Called once, before the instance is destroyed.
        // Add 'implements OnDestroy' to the class.
        this._unSubs$.next();
        this._unSubs$.complete();

        // Menghapus tab yang terpilih.
        this.associationService.selectTab(null);
        // Menghapus view by yang terpilih.
        this.associationService.selectViewBy(null);

        // Reset core state sales reps
        this.store.dispatch(AssociationActions.clearState());

        this.store.dispatch(UiActions.createBreadcrumb({ payload: null }));
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
