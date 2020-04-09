import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { TypedAction } from '@ngrx/store/src/models';
import { HelperService, NoticeService } from 'app/shared/helpers';

import { FlexiComboApiService } from '../../services/flexi-combo-api.service';
import * as fromFlexiCombos from '../reducers';

type AnyAction = TypedAction<any> | ({ payload: any } & TypedAction<any>);
@Injectable()
export class FlexiComboEffects {
    // -----------------------------------------------------------------------------------------------------
    // @ CRUD methods [CREATE - FLEXI COMBO]
    // -----------------------------------------------------------------------------------------------------

    constructor(
        private actions$: Actions,
        private matDialog: MatDialog,
        private router: Router,
        private store: Store<fromFlexiCombos.FeatureState>,
        private _$helper: HelperService,
        private _$notice: NoticeService,
        private _$flexiComboApi: FlexiComboApiService
    ) {}
}
