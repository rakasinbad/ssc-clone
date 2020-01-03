import {
    Component,
    OnInit,
    ChangeDetectionStrategy,
    ViewEncapsulation,
    OnDestroy
} from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';
import { ActivatedRoute } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
// NgRx's Libraries
import { Store } from '@ngrx/store';
// RxJS' Libraries
import { Observable, Subject, merge } from 'rxjs';
// Environment variables.
import { environment } from 'environments/environment';
import { UiSelectors } from 'app/shared/store/selectors';
import { UiActions } from 'app/shared/store/actions';
// Entity model.
// State management's stuffs.
import * as fromAssociations from '../../store/reducers';
import { AssociationActions } from '../../store/actions';
import { AssociationSelectors } from '../../store/selectors';
import { Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { FormControl } from '@angular/forms';

@Component({
    selector: 'app-associations-view-by',
    templateUrl: './association-view-by.component.html',
    styleUrls: ['./association-view-by.component.scss'],
    animations: [
        fuseAnimations,
        trigger('enterAnimation', [
            transition(':enter', [
                style({ transform: 'translateX(100%)', opacity: 0 }),
                animate('500ms', style({ transform: 'translateX(0)', opacity: 1 }))
            ]),
            transition(':leave', [
                style({ transform: 'translateX(0)', opacity: 1 }),
                animate('500ms', style({ transform: 'translateX(100%)', opacity: 0 }))
            ])
        ])
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AssociationViewByComponent implements OnInit, OnDestroy {
    private _unSubs$: Subject<void>;

    buttonViewByActive$: Observable<string>;

    constructor(
        private route: ActivatedRoute,
        private domSanitizer: DomSanitizer,
        private store: Store<fromAssociations.FeatureState>,
        private _fuseTranslationLoaderService: FuseTranslationLoaderService
    ) {}

    ngOnInit(): void {
        this.store.dispatch(UiActions.setCustomToolbarActive({ payload: 'sales-rep' }));
        this.buttonViewByActive$ = this.store.select(UiSelectors.getCustomToolbarActive);
    }

    ngOnDestroy(): void {
        // Called once, before the instance is destroyed.
        // Add 'implements OnDestroy' to the class.

        // Reset core state sales reps
        this.store.dispatch(AssociationActions.clearPortfolioState());

        this._unSubs$.next();
        this._unSubs$.complete();
    }

    clickTabViewBy(action: 'sales-rep' | 'portfolio' | 'store'): void {
        if (!action) {
            return;
        }

        switch (action) {
            case 'sales-rep':
                this.store.dispatch(UiActions.setCustomToolbarActive({ payload: 'sales-rep' }));
                break;
            case 'portfolio':
                this.store.dispatch(UiActions.setCustomToolbarActive({ payload: 'portfolio' }));
                break;
            case 'store':
                this.store.dispatch(UiActions.setCustomToolbarActive({ payload: 'store' }));
                break;

            default:
                return;
        }
    }
}
