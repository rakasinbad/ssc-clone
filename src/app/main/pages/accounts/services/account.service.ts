/* import { MatTableDataSource } from '@angular/material/table';
import { Injectable } from '@angular/core';
import { Store, Action, select } from '@ngrx/store';
import * as fromAccount from './stores/account.reducer';
import { Observable } from 'rxjs';
import { Account } from './account.model';
import { selectAllAccountSource } from './stores/account.selectors';
import { map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class AccountService {
    dataSource: MatTableDataSource<Account>;
    total: number;

    constructor(private store: Store<fromAccount.FeatureState>) {
        this.dataSource = new MatTableDataSource<Account>();
    }

    loadTable(pageSize: number, pageIndex: number) {
        this.store.select(selectAllAccountSource).subscribe(source => {
            this.dataSource.data = source.data.slice(
                pageIndex * pageSize,
                (pageIndex + 1) * pageSize
            );

            this.total = source.total;
        });
    }

    dispatch(action: Action) {
        this.store.dispatch(action);
    }
}
 */
