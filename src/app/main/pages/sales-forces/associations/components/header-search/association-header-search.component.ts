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
// Entity model.
// State management's stuffs.
import * as fromAssociations from '../../store/reducers';
import { AssociationActions } from '../../store/actions';
import { AssociationSelectors } from '../../store/selectors';
import { Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { FormControl } from '@angular/forms';

@Component({
    selector: 'app-associations-header-search',
    templateUrl: './association-header-search.component.html',
    styleUrls: ['./association-header-search.component.scss'],
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
export class AssociationHeaderSearchComponent implements OnInit, OnDestroy {
    private _unSubs$: Subject<void> = new Subject<void>();

    search: FormControl;

    constructor(
        private route: ActivatedRoute,
        private domSanitizer: DomSanitizer,
        private store: Store<fromAssociations.FeatureState>,
        private _fuseTranslationLoaderService: FuseTranslationLoaderService
    ) {}

    ngOnInit(): void {
        this.search = new FormControl('');
    }

    ngOnDestroy(): void {
        // Called once, before the instance is destroyed.
        // Add 'implements OnDestroy' to the class.

        // Reset core state sales reps
        this.store.dispatch(AssociationActions.clearState());

        this._unSubs$.next();
        this._unSubs$.complete();
    }
}
