import {
    ChangeDetectionStrategy,
    Component,
    OnInit,
    ChangeDetectorRef,
    ViewEncapsulation,
} from '@angular/core';
import { MatDialog } from '@angular/material';
import { Store } from '@ngrx/store';
import { ShowImageComponent } from 'app/shared/modals/show-image/show-image.component';
import { Observable } from 'rxjs';

import { SkpModel } from '../../../models';
import * as fromSkp from '../../../store/reducers';
import { SkpSelectors } from '../../../store/selectors';

import { Subscription } from 'rxjs';
import { HelperService } from 'app/shared/helpers';
import { map } from 'rxjs/operators';
import * as _ from 'lodash';

@Component({
  selector: 'app-detail-general',
  templateUrl: './detail-general.component.html',
  styleUrls: ['./detail-general.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailGeneralComponent implements OnInit {
    skpGeneral$: Observable<SkpModel>;
    isLoading$: Observable<boolean>;
    
    public typePromoAlloc: any;
    public subsFlexi: Subscription;
    statusSkpType = this._$helperService.skpStatusType();
    
    constructor(
        private matDialog: MatDialog,
        private store: Store<fromSkp.FeatureState>,
        private _$helperService: HelperService,
        private cdRef: ChangeDetectorRef
    ) {}

   // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.

        this.skpGeneral$ = this.store.select(SkpSelectors.getSelectedItem).pipe(
            map((item) => {
                return item;
            })
        );

        this.isLoading$ = this.store.select(SkpSelectors.getIsLoading);

        this.cdRef.detectChanges();

    }

    onShowImage(imageUrl: string, title: string): void {
        if (!imageUrl || !title) {
            return;
        }

        this.matDialog.open(ShowImageComponent, {
            data: {
                title: title || '',
                url: imageUrl || '',
            },
            disableClose: true,
        });
    }

}
