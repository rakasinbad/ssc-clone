import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FuseConfigService } from '@fuse/services/config.service';
import { Store } from '@ngrx/store';
import * as fromRoot from 'app/store/app.reducer';
import { Observable } from 'rxjs';

import { AuthSelectors } from '../../auth/store/selectors';

@Component({
    selector: 'error-maintenance',
    templateUrl: './error-maintenance.component.html',
    styleUrls: ['./error-maintenance.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ErrorMaintenanceComponent implements OnInit {
    isAuth$: Observable<boolean>;

    constructor(
        private store: Store<fromRoot.State>,
        private _fuseConfigService: FuseConfigService
    ) {
        // Configure the layout
        this._fuseConfigService.config = {
            layout: {
                navbar: {
                    hidden: true
                },
                toolbar: {
                    hidden: true
                },
                footer: {
                    hidden: true
                },
                sidepanel: {
                    hidden: true
                }
            }
        };
    }

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.

        this.isAuth$ = this.store.select(AuthSelectors.getIsAuth);
    }
}
