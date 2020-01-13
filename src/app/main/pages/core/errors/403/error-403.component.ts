import { ChangeDetectionStrategy } from '@angular/compiler/src/core';
import { Component, ViewEncapsulation } from '@angular/core';
import { FuseConfigService } from '@fuse/services/config.service';
import { Store } from '@ngrx/store';
import * as fromRoot from 'app/store/app.reducer';

import { AuthActions } from '../../auth/store/actions';

@Component({
    selector: 'error-403',
    templateUrl: './error-403.component.html',
    styleUrls: ['./error-403.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class Error403Component {
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

    onLogout(): void {
        this.store.dispatch(AuthActions.authLogout());
    }
}
