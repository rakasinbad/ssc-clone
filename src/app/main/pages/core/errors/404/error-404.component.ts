import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FuseConfigService } from '@fuse/services/config.service';
import { Store } from '@ngrx/store';
import * as fromRoot from 'app/store/app.reducer';
import { CookieService } from 'ngx-cookie-service';
import { Observable } from 'rxjs';

import { AuthSelectors } from '../../auth/store/selectors';

@Component({
    selector: 'error-404',
    templateUrl: './error-404.component.html',
    styleUrls: ['./error-404.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class Error404Component implements OnInit {
    isAuth: boolean;

    constructor(
        private store: Store<fromRoot.State>,
        private _cookieService: CookieService,
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

        this.isAuth = this._cookieService.check('ssc-token');
    }
}
