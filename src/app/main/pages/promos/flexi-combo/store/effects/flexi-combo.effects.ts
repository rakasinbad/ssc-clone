import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store as NgRxStore } from '@ngrx/store';
import { MatSnackBarConfig } from '@angular/material';
import {
    exhaustMap,
    map,
    switchMap,
    withLatestFrom,
    catchError,
    retry,
    tap,
    finalize
} from 'rxjs/operators';

import { FlexiComboActions, failureActionNames } from '../actions';
import { fromAuth } from 'app/main/pages/core/auth/store/reducers';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { of, Observable } from 'rxjs';
import { FlexiComboApiService } from '../../services/flexi-combo-api.service';
import { catchOffline } from '@ngx-pwa/offline';
import { FlexiCombo, FlexiComboCreationPayload } from '../../models/flexi-combo.model';
import { Auth } from 'app/main/pages/core/auth/models';
import { HelperService, NoticeService } from 'app/shared/helpers';
import { HttpErrorResponse } from '@angular/common/http';
import { fromFlexiCombo } from '../reducers';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { DeleteConfirmationComponent } from 'app/shared/modals/delete-confirmation/delete-confirmation.component';
import { IQueryParams } from 'app/shared/models/query.model';
import { TNullable, ErrorHandler, IPaginatedResponse } from 'app/shared/models/global.model';
import { User } from 'app/shared/models/user.model';
import { AnyAction } from 'app/shared/models/actions.model';
import { FormActions, UiActions } from 'app/shared/store/actions';

@Injectable()
export class FlexiComboEffects {
    constructor(
        private actions$: Actions,
        private authStore: NgRxStore<fromAuth.FeatureState>,
        private FlexiComboStore: NgRxStore<fromFlexiCombo.FlexiComboState>,
        private FlexiComboApi$: FlexiComboApiService,
        private notice$: NoticeService,
        private router: Router,
        private helper$: HelperService,
        private matDialog: MatDialog
    ) {}
}
