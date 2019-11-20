import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material';
import { fuseAnimations } from '@fuse/animations';
import { Store } from '@ngrx/store';
import { IQueryParams } from 'app/shared/models';
import { Observable } from 'rxjs';

import { CreditLimitGroupFormComponent } from '../credit-limit-group-form/credit-limit-group-form.component';
import { CreditLimitArea, CreditLimitGroup } from '../models';
import { CreditLimitBalanceActions } from '../store/actions';
import { fromCreditLimitBalance } from '../store/reducers';
import { CreditLimitBalanceSelectors } from '../store/selectors';

@Component({
    selector: 'app-credit-limit-group',
    templateUrl: './credit-limit-group.component.html',
    styleUrls: ['./credit-limit-group.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreditLimitGroupComponent implements OnInit {
    creditLimitGroups$: Observable<CreditLimitGroup[]>;
    isLoading$: Observable<boolean>;

    constructor(
        private matDialog: MatDialog,
        private store: Store<fromCreditLimitBalance.FeatureState>
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.

        this.creditLimitGroups$ = this.store.select(
            CreditLimitBalanceSelectors.getAllCreditLimitGroup
        );
        this.initList();
        this.isLoading$ = this.store.select(CreditLimitBalanceSelectors.getIsLoading);
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    joinCreditLimitAreas(creditLimitAreas: CreditLimitArea[]): string {
        if (creditLimitAreas.length > 0) {
            return creditLimitAreas.map(i => i.unitType).join(',<br>');
        }

        return '-';
    }

    onSetup(id?: string): void {
        this.matDialog.open(CreditLimitGroupFormComponent, {
            data: {
                title: 'Set Credit Limit',
                id: !id || id === 'new' ? 'new' : id
            },
            disableClose: true
        });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    private initList(): void {
        const data: IQueryParams = {};
        data['paginate'] = false;

        this.store.dispatch(
            CreditLimitBalanceActions.fetchCreditLimitGroupsRequest({ payload: data })
        );
    }
}
