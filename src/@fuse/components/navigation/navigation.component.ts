import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Input,
    isDevMode,
    OnDestroy,
    OnInit,
    ViewEncapsulation
} from '@angular/core';
import { FuseNavigationService } from '@fuse/components/navigation/navigation.service';
import { merge, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'fuse-navigation',
    templateUrl: './navigation.component.html',
    styleUrls: ['./navigation.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FuseNavigationComponent implements OnInit, OnDestroy {
    @Input()
    layout = 'vertical';

    @Input()
    navigation: any;

    navigations: any;

    // Private
    private _unsubscribeAll: Subject<any>;

    /**
     *
     * @param {ChangeDetectorRef} _changeDetectorRef
     * @param {FuseNavigationService} _fuseNavigationService
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseNavigationService: FuseNavigationService
    ) {
        // Set the private defaults
        this._unsubscribeAll = new Subject();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Load the navigation either from the input or from the service
        this.navigation = this.navigation || this._fuseNavigationService.getCurrentNavigation();

        if (isDevMode()) {
            console.groupCollapsed('NAVIGATION 1');

            console.groupCollapsed('navigations');
            console.log(this.navigations);
            console.groupEnd();

            console.groupCollapsed('navigation');
            console.log(this.navigation);
            console.groupEnd();

            console.groupCollapsed('layout');
            console.log(this.layout);
            console.groupEnd();

            console.groupCollapsed('getCurrent');
            console.log(this._fuseNavigationService.getCurrentNavigation());
            console.groupEnd();

            console.groupEnd();
        }

        // Subscribe to the current navigation changes
        this._fuseNavigationService.onNavigationChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(key => {
                // Load the navigation
                this.navigation = this._fuseNavigationService.getCurrentNavigation();

                if (isDevMode()) {
                    console.groupCollapsed('NAVIGATION 1 [CHANGED]', key);

                    console.groupCollapsed('navigations');
                    console.log(this.navigations);
                    console.groupEnd();

                    console.groupCollapsed('navigation');
                    console.log(this.navigation);
                    console.groupEnd();

                    console.groupCollapsed('layout');
                    console.log(this.layout);
                    console.groupEnd();

                    console.groupCollapsed('getCurrent');
                    console.log(this._fuseNavigationService.getCurrentNavigation());
                    console.groupEnd();

                    console.groupEnd();
                }

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        this._fuseNavigationService.onNavigationRegistered
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(([key, nav]) => {
                // Load the navigation
                // this.navigations = this.navigation;

                if (key === 'customNavigation') {
                    this.navigations = nav;
                }

                if (isDevMode()) {
                    console.groupCollapsed('NAVIGATION 1 [REGISTERED]', key, nav);

                    console.groupCollapsed('navigations');
                    console.log(this.navigations);
                    console.groupEnd();

                    console.groupCollapsed('navigation');
                    console.log(this.navigation);
                    console.groupEnd();

                    console.groupCollapsed('layout');
                    console.log(this.layout);
                    console.groupEnd();

                    console.groupCollapsed('getCurrent');
                    console.log(this._fuseNavigationService.getCurrentNavigation());
                    console.groupEnd();

                    console.groupEnd();
                }

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Subscribe to navigation item
        merge(
            this._fuseNavigationService.onNavigationItemAdded,
            this._fuseNavigationService.onNavigationItemUpdated,
            this._fuseNavigationService.onNavigationItemRemoved
        )
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(() => {
                const customNavigations = this._fuseNavigationService.getNavigation(
                    'customNavigation'
                );

                if (customNavigations) {
                    this.navigations = customNavigations;
                }

                if (isDevMode()) {
                    console.groupCollapsed('NAVIGATION 1 [UPDATE]');

                    console.groupCollapsed('navigations');
                    console.log(this.navigations);
                    console.groupEnd();

                    console.groupCollapsed('navigation');
                    console.log(this.navigation);
                    console.groupEnd();

                    console.groupCollapsed('layout');
                    console.log(this.layout);
                    console.groupEnd();

                    console.groupCollapsed('getCurrent');
                    console.log(this._fuseNavigationService.getCurrentNavigation());
                    console.groupEnd();

                    console.groupEnd();
                }

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }
}
