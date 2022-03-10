import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import {
    IBreadcrumbs,
    IFooterActionConfig,
    LifecyclePlatform,
} from 'app/shared/models/global.model';
import { Location } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { Store } from '@ngrx/store';
import { FormActions, UiActions } from 'app/shared/store/actions';
import { FormSelectors } from 'app/shared/store/selectors';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import * as _ from 'lodash';
import { Subject } from 'rxjs';
import { filter, takeUntil, withLatestFrom } from 'rxjs/operators';
import { fromOrder } from '../../store/reducers';
import { CreateManualOrder } from '../../models';

@Component({
    selector: 'app-order-add',
    templateUrl: './order-add.component.html',
    styleUrls: ['./order-add.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderAddComponent implements OnInit, AfterViewInit, OnDestroy {
    private _unSubs$: Subject<void> = new Subject<void>();
    form: FormGroup;

    private _breadCrumbs: IBreadcrumbs[] = [
        {
            title: 'Home',
        },
        {
            title: 'OMS',
        },
        {
            title: 'Manual Order',
            active: true,
            translate: 'BREADCRUMBS.ORDER_MANAGEMENTS',
        },
    ];

    private footerConfig: IFooterActionConfig = {
        progress: {
            title: {
                label: 'Order Add',
                active: false,
            },
            value: {
                active: false,
            },
            active: false,
        },
        action: {
            save: {
                label: 'Next',
                active: true,
            },
            draft: {
                label: 'Save Draft',
                active: false,
            },
            cancel: {
                label: 'Cancel',
                active: true,
            },
        },
    };

    constructor(
        private cdRef: ChangeDetectorRef,
        private domSanitizer: DomSanitizer,
        private formBuilder: FormBuilder,
        private location: Location,
        private route: ActivatedRoute,
        private store: Store<fromOrder.FeatureState>
    ) {}

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

    private _initPage(lifeCycle?: LifecyclePlatform): void {
        switch (lifeCycle) {
            case LifecyclePlatform.AfterViewInit:
                // Display footer action
                this.store.dispatch(UiActions.showFooterAction());
                break;

            case LifecyclePlatform.OnDestroy:
                this.store.dispatch(FormActions.resetClickCancelButton());

                this.store.dispatch(FormActions.resetCancelButtonAction());

                // Reset form status state
                this.store.dispatch(FormActions.resetFormStatus());

                // Reset click save button state
                this.store.dispatch(FormActions.resetClickSaveButton());

                // Hide footer action
                this.store.dispatch(UiActions.hideFooterAction());

                this._unSubs$.next();
                this._unSubs$.complete();
                break;

            default:
                // Set breadcrumbs
                this.store.dispatch(
                    UiActions.createBreadcrumb({
                        payload: this._breadCrumbs,
                    })
                );

                // Set footer action
                this.store.dispatch(
                    UiActions.setFooterActionConfig({ payload: this.footerConfig })
                );

                this.store.dispatch(FormActions.setCancelButtonAction({ payload: 'CANCEL' }));
                this.store.dispatch(FormActions.enableSaveButton());

                const { id } = this.route.snapshot.params;
        }

        // Handle cancel button action (footer)
        this.store
            .select(FormSelectors.getIsClickCancelButton)
            .pipe(
                filter((isClick) => !!isClick),
                takeUntil(this._unSubs$)
            )
            .subscribe((isClick) => {
                this.location.back();

                this.store.dispatch(FormActions.resetClickCancelButton());
                this.store.dispatch(FormActions.resetCancelButtonAction());
            });

        // Handle save button action (footer)
        this.store
            .select(FormSelectors.getIsClickSaveButton)
            .pipe(
                takeUntil(this._unSubs$),
                withLatestFrom(this.store.select(AuthSelectors.getUserSupplier))
            )
            .subscribe(([isClick, userSupplier]) => {
                if (isClick) {
                  //submit to post cart preview
                    this._onSubmit(userSupplier.supplierId);
                }
            });
    }

    private _onSubmit(supplierId: string): void {
        if (this.form.invalid) {
            return;
        }

        const body = this.form.getRawValue();
        const { name } = body;

        const payload: CreateManualOrder = {
            supplierId,
            name,
        };

    }
}
