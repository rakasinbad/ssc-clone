import {
    ChangeDetectionStrategy,
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { Store } from '@ngrx/store';
import { Observable, of, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { User } from 'app/shared/models/user.model';
import { IInternalDemo, IInternalEmployeeDetails, InternalEmployeeDetails } from '../models';
import { fromInternal } from '../store/reducers';
import { InternalSelectors } from '../store/selectors';
import { InternalActions } from '../store/actions';
import { UiActions } from 'app/shared/store/actions';
import { IBreadcrumbs } from 'app/shared/models/global.model';
import { HelperService } from 'app/shared/helpers';

@Component({
    selector: 'app-internal-detail',
    templateUrl: './internal-detail.component.html',
    styleUrls: ['./internal-detail.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class InternalDetailComponent implements OnInit, OnDestroy {
    private subs$: Subject<void> = new Subject<void>();

    employee$ : Observable<IInternalEmployeeDetails>;
    isLoading$: Observable<boolean>;

    private createBreadcrumbs(): void {
        // Menyiapkan breadcrumb-nya.
        const breadcrumbs: Array<IBreadcrumbs> = [
            {
                title: 'Home',
                // translate: 'BREADCRUMBS.HOME',
                active: false
            },
            {
                title: 'User Management',
                // translate: 'BREADCRUMBS.CATALOGUE',
                active: false,
                // url: '/pages/catalogues'
            },
            {
                title: 'Store Detail',
                active: true,
                // translate: 'BREADCRUMBS.CATALOGUE',
                // url: '/pages/catalogues'
            },
        ];

        // Memunculkan breadcrumb.
        this.store.dispatch(
            UiActions.createBreadcrumb({
                payload: breadcrumbs
            })
        );
    }

    constructor(
        private store: Store<fromInternal.FeatureState>,
        private route: ActivatedRoute,
        private router: Router,
    ) {
        this.createBreadcrumbs();
    }

    ngOnInit(): void {
        const { id } = this.route.snapshot.params;
        
        this.employee$ = this.store.select(InternalSelectors.getInternalEmployee)
                            .pipe(
                                takeUntil(this.subs$)
                            );

        this.isLoading$ = this.store.select(InternalSelectors.getIsLoading).pipe(
            takeUntil(this.subs$)
        );

        this.store.dispatch(InternalActions.fetchInternalEmployeeRequest({ payload: id }));
    }

    ngOnDestroy(): void {
        this.subs$.next();
        this.subs$.complete();
    }

    onEdit() : void {
        const { id } = this.route.snapshot.params;
        this.router.navigateByUrl(`/pages/account/internal/${id}/edit`);
    }
}
