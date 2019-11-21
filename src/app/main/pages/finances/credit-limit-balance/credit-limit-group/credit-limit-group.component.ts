import {
    ChangeDetectionStrategy,
    Component,
    OnInit,
    ViewEncapsulation,
    OnDestroy
} from '@angular/core';
import { MatDialog } from '@angular/material';
import { fuseAnimations } from '@fuse/animations';
import { Store } from '@ngrx/store';
import { IQueryParams } from 'app/shared/models';
import { Observable, Subject } from 'rxjs';

import { CreditLimitGroupFormComponent } from '../credit-limit-group-form/credit-limit-group-form.component';
import { CreditLimitArea, CreditLimitGroup } from '../models';
import { CreditLimitBalanceActions } from '../store/actions';
import { fromCreditLimitBalance } from '../store/reducers';
import { CreditLimitBalanceSelectors } from '../store/selectors';
import { takeUntil } from 'rxjs/operators';
import { LogService } from 'app/shared/helpers';

@Component({
    selector: 'app-credit-limit-group',
    templateUrl: './credit-limit-group.component.html',
    styleUrls: ['./credit-limit-group.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreditLimitGroupComponent implements OnInit, OnDestroy {
    creditLimitGroups$: Observable<CreditLimitGroup[]>;
    isLoading$: Observable<boolean>;

    private _unSubs$: Subject<void>;

    constructor(
        private matDialog: MatDialog,
        private store: Store<fromCreditLimitBalance.FeatureState>,
        private _$log: LogService
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.

        this._unSubs$ = new Subject<void>();

        this.creditLimitGroups$ = this.store.select(
            CreditLimitBalanceSelectors.getAllCreditLimitGroup
        );

        this.isLoading$ = this.store.select(CreditLimitBalanceSelectors.getIsLoading);

        this.initList();
    }

    ngOnDestroy(): void {
        // Called once, before the instance is destroyed.
        // Add 'implements OnDestroy' to the class.

        this._unSubs$.next();
        this._unSubs$.complete();
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
        const dialogRef = this.matDialog.open<
            CreditLimitGroupFormComponent,
            any,
            { action: string; payload: any }
        >(CreditLimitGroupFormComponent, {
            data: {
                title: 'Set Credit Limit',
                id: !id || id === 'new' ? 'new' : id
            },
            disableClose: true
        });

        dialogRef
            .afterClosed()
            .pipe(takeUntil(this._unSubs$))
            .subscribe(resp => {
                this._$log.generateGroup(
                    `[AFTER CLOSED DIALOG ${resp.action.toUpperCase()} CREDIT LIMIT GROUP]`,
                    {
                        response: {
                            type: 'log',
                            value: resp
                        }
                    },
                    'groupCollapsed'
                );

                if (resp.action === 'new' && resp.payload) {
                    this.store.dispatch(
                        CreditLimitBalanceActions.createCreditLimitGroupRequest({
                            payload: resp.payload
                        })
                    );
                }
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
