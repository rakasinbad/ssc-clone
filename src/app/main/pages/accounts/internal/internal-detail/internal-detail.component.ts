import {
    ChangeDetectionStrategy,
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { fuseAnimations } from '@fuse/animations';
import { Store } from '@ngrx/store';
import { UiActions } from 'app/shared/store/actions';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { IInternalDemo } from '../models';
import { fromInternal } from '../store/reducers';
import { InternalSelectors } from '../store/selectors';

@Component({
    selector: 'app-internal-detail',
    templateUrl: './internal-detail.component.html',
    styleUrls: ['./internal-detail.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class InternalDetailComponent implements OnInit, OnDestroy {

    constructor() {
    }

    ngOnInit(): void {
       
    }

    ngOnDestroy(): void {
        
    }
}
