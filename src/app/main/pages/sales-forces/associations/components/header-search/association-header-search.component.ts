import { animate, style, transition, trigger } from '@angular/animations';
import {
    ChangeDetectionStrategy,
    Component,
    OnDestroy,
    OnInit,
    SecurityContext,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginator, MatSort } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { Store } from '@ngrx/store';
import { environment } from 'environments/environment';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, takeUntil } from 'rxjs/operators';

import { AssociationActions } from '../../store/actions';
import * as fromAssociations from '../../store/reducers';

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

    // Menyimpan jumlah data yang ditampilkan dalam 1 halaman.
    defaultPageSize: number = environment.pageSize;

    // Untuk unsubscribe semua Observable.
    subs$: Subject<void> = new Subject<void>();

    // ViewChild untuk MatPaginator.
    @ViewChild(MatPaginator, { static: true })
    paginator: MatPaginator;

    // ViewChild untuk MatSort.
    @ViewChild(MatSort, { static: true })
    sort: MatSort;

    constructor(
        private route: ActivatedRoute,
        private readonly sanitizer: DomSanitizer,
        private store: Store<fromAssociations.FeatureState>,
        private _fuseTranslationLoaderService: FuseTranslationLoaderService
    ) {}

    ngOnInit(): void {
        this.search = new FormControl('');

        this.search.valueChanges
            .pipe(
                distinctUntilChanged(),
                debounceTime(1000),
                filter(value => {
                    const sanitized = this.sanitizer.sanitize(SecurityContext.HTML, value);
                    if (sanitized) {
                        this.store.dispatch(
                            AssociationActions.setSearchValue({ payload: sanitized })
                        );
                        return true;
                    } else {
                        if (value.length === 0) {
                            this.store.dispatch(AssociationActions.setSearchValue({ payload: '' }));
                            return true;
                        } else {
                            return false;
                        }
                    }
                }),
                takeUntil(this.subs$)
            )
            .subscribe(() => {
                // this.onRefreshTable();
            });
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
