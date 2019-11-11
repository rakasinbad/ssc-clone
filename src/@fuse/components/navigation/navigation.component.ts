import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Input,
    OnInit,
    ViewEncapsulation,
    OnDestroy
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
        this.navigations = this.navigation || this._fuseNavigationService.getCurrentNavigation();

        console.log('NAVIGATION 1', this.navigations, this.navigation, this.layout);

        // Subscribe to the current navigation changes
        this._fuseNavigationService.onNavigationChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(() => {
                // Load the navigation
                // this.navigations = this._fuseNavigationService.getCurrentNavigation();
                this.navigations =
                    this.navigation || this._fuseNavigationService.getCurrentNavigation();

                console.log(
                    'NAVIGATION 2A CHANGED',
                    this.navigations,
                    this.navigation,
                    this.layout
                );

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        this._fuseNavigationService.onNavigationRegistered
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(() => {
                // Load the navigation
                this.navigations = this.navigation;

                console.log(
                    'NAVIGATION 2B REGISTERED',
                    this.navigations,
                    this.navigation,
                    this.layout
                );

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
                console.log('NAVIGATION 2C UPDATE', this.navigations, this.navigation, this.layout);

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }
}
