import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { Store as NgRxStore } from '@ngrx/store';

import { FeatureState as PeriodTargetPromoCoreState } from '../../store/reducers';
import { UiActions } from 'app/shared/store/actions';
import { Subject } from 'rxjs';

@Component({
    selector: 'period-target-promo-form',
    templateUrl: './form.component.html',
    styleUrls: ['./form.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class PeriodTargetPromoFormComponent implements OnInit, OnDestroy {

    // Untuk keperluan unsubscribe.
    private subs$: Subject<void> = new Subject<void>();

    constructor(
        private PeriodTargetPromoStore: NgRxStore<PeriodTargetPromoCoreState>
    ) {
        // Memuat breadcrumb.
        this.PeriodTargetPromoStore.dispatch(
            UiActions.createBreadcrumb({
                payload: [
                    {
                        title: 'Home'
                    },
                    {
                        title: 'Promo'
                    },
                    {
                        title: 'Period Target Promo',
                        keepCase: true
                    },
                    {
                        title: 'Add Period Target Promo',
                        keepCase: true,
                        active: true
                    }
                ]
            })
        );
    }

    ngOnInit(): void {
    }

    ngOnDestroy(): void {
        this.subs$.next();
        this.subs$.complete();

        this.PeriodTargetPromoStore.dispatch(UiActions.createBreadcrumb({ payload: null }));
    }

}
