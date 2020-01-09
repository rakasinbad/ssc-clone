import {
    Component,
    OnInit,
    ChangeDetectionStrategy,
    ViewEncapsulation,
    OnDestroy
} from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';
import { fuseAnimations } from '@fuse/animations';
// NgRx's Libraries
import { Store } from '@ngrx/store';
// RxJS' Libraries
import { Observable, Subject } from 'rxjs';
// Environment variables.
import { UiSelectors } from 'app/shared/store/selectors';
import { UiActions } from 'app/shared/store/actions';
// Entity model.
// State management's stuffs.
import * as fromAssociations from '../../store/reducers';
import { AssociationActions } from '../../store/actions';

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
    private _unSubs$: Subject<void> = new Subject<void>();

    buttonViewByActive$: Observable<string>;

    constructor(private store: Store<fromAssociations.FeatureState>) {}

    ngOnInit(): void {
        this.store.dispatch(UiActions.setCustomToolbarActive({ payload: 'sales-rep' }));
        this.buttonViewByActive$ = this.store.select(UiSelectors.getCustomToolbarActive);
    }

    ngOnDestroy(): void {
        // Called once, before the instance is destroyed.
        // Add 'implements OnDestroy' to the class.

        // Reset core state sales reps
        this.store.dispatch(AssociationActions.clearState());

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
