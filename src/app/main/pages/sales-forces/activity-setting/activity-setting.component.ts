import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
import { StorageMap } from '@ngx-pwa/local-storage';
import { IBreadcrumbs } from 'app/shared/models/global.model';
import { UiActions } from 'app/shared/store/actions';
import * as fromRoot from 'app/store/app.reducer';
import { environment } from 'environments/environment';
import { BehaviorSubject } from 'rxjs';

@Component({
    selector: 'app-Activity-setting',
    templateUrl: './activity-setting.component.html',
    styleUrls: ['./activity-setting.component.scss'],
})
export class ActivitySettingComponent implements OnInit {
    url$: BehaviorSubject<SafeResourceUrl> = new BehaviorSubject<SafeResourceUrl>('');
    isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

    private readonly breadcrumbs: IBreadcrumbs[] = [
        {
            title: 'Home',
        },
        {
            title: 'Sales Management',
        },
        {
            title: 'Activity Setting',
        },
    ];

    constructor(
        private domSanitizer: DomSanitizer,
        private store: Store<fromRoot.State>,
        private storage: StorageMap
    ) {}

    ngOnInit(): void {
        this.store.dispatch(UiActions.createBreadcrumb({ payload: this.breadcrumbs }));

        // this.storage.get('user').subscribe((data: any) => {
        //     const safeUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(
        //         `${environment.microSiteHost}/salessetting?token=${data.token}`
        //     );

        //     this.url$.next(safeUrl);
        // });
        this.isLoading$.next(false);
    }

    onLoad(): void {
        this.isLoading$.next(false);
    }
}
