import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FuseConfigService } from '@fuse/services/config.service';
import { Store } from '@ngrx/store';
import { navigation } from 'app/navigation/navigation';
import { SinbadFilterConfig } from 'app/shared/components/sinbad-filter/models/sinbad-filter.model';
import { SinbadFilterService } from 'app/shared/components/sinbad-filter/services/sinbad-filter.service';
import { UiSelectors } from 'app/shared/store/selectors';
import * as fromRoot from 'app/store/app.reducer';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'vertical-layout-1',
    templateUrl: './layout-1.component.html',
    styleUrls: ['./layout-1.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class VerticalLayout1Component implements OnInit, OnDestroy {
    private unSubs$: Subject<any> = new Subject();

    fuseConfig: any;
    navigation: any;
    filterConfig: SinbadFilterConfig;

    isShowCustomToolbar$: Observable<boolean>;
    isShowFooterAction$: Observable<boolean>;

    constructor(
        private store: Store<fromRoot.State>,
        private fuseConfigService: FuseConfigService,
        private sinbadFilterService: SinbadFilterService
    ) {
        // Set the defaults
        this.navigation = navigation;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {
        // Subscribe to config changes
        this.fuseConfigService.config.pipe(takeUntil(this.unSubs$)).subscribe((config) => {
            this.fuseConfig = config;
        });

        // Get sinbad filter config
        this.sinbadFilterService
            .getConfig$()
            .pipe(takeUntil(this.unSubs$))
            .subscribe((config) => {
                this.filterConfig = config;
            });

        this.isShowCustomToolbar$ = this.store.select(UiSelectors.getIsShowCustomToolbar);
        this.isShowFooterAction$ = this.store.select(UiSelectors.getIsShowFooterAction);
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this.unSubs$.next();
        this.unSubs$.complete();
    }
}
