import { Component, HostBinding, Input, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { UiSelectors } from 'app/shared/store/selectors';
import * as fromRoot from 'app/store/app.reducer';
import { Observable } from 'rxjs';

@Component({
    selector: 'fuse-nav-horizontal-item',
    templateUrl: './item.component.html',
    styleUrls: ['./item.component.scss']
})
export class FuseNavHorizontalItemComponent implements OnInit {
    @HostBinding('class')
    classes = 'nav-item';

    @Input()
    item: any;

    currentCustomToolbarActive$: Observable<string>;

    constructor(public store: Store<fromRoot.State>, public translate: TranslateService) {}

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.

        this.currentCustomToolbarActive$ = this.store.select(UiSelectors.getCustomToolbarActive);
    }

    isActive(name, selectedActive): boolean {
        console.log('isActive', name, selectedActive, name === selectedActive);
        return name === selectedActive;
    }
}
