import {
    ChangeDetectionStrategy,
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation
} from '@angular/core';
import { MatDialog } from '@angular/material';
import { fuseAnimations } from '@fuse/animations';
import { Store } from '@ngrx/store';
import { LogService } from 'app/shared/helpers';
import { IQueryParams } from 'app/shared/models';
import { UiActions } from 'app/shared/store/actions';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

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
export class CreditLimitGroupComponent implements OnInit, OnDestroy {
    creditLimitGroups$: Observable<CreditLimitGroup[]>;
    selectedRowIndex$: Observable<string>;
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
        if (creditLimitAreas && creditLimitAreas.length > 0) {
            return creditLimitAreas.map(i => i.unitType).join(',<br>');
        }

        return '-';
    }

    onDelete(item: CreditLimitGroup): void {
        this._$log.generateGroup(
            'DELETE CREDIT LIMIT GROUP',
            {
                id: {
                    type: 'log',
                    value: item.id || null
                },
                item: {
                    type: 'log',
                    value: item
                }
            },
            'groupCollapsed'
        );

        if (!item || !item.id) {
            return;
        }

        this.store.dispatch(UiActions.setHighlightRow({ payload: item.id }));
        this.store.dispatch(
            CreditLimitBalanceActions.confirmDeleteCreditLimitGroup({ payload: item })
        );
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
                    `[AFTER CLOSED DIALOG ${resp &&
                        resp.action &&
                        resp.action.toUpperCase()} CREDIT LIMIT GROUP]`,
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
                } else if (resp.action === 'edit' && resp.payload) {
                    this.store.dispatch(
                        CreditLimitBalanceActions.updateCreditLimitGroupRequest({
                            payload: resp.payload
                        })
                    );
                }
            });
    }

    safeValue(item: string): string {
        return item ? item : '-';
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
