import 'hammerjs';

import { AgmCoreModule } from '@agm/core';
import { getCurrencySymbol, registerLocaleData } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import localId from '@angular/common/locales/id';
import { APP_INITIALIZER, LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ServiceWorkerModule } from '@angular/service-worker';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { FuseProgressBarModule, FuseSidebarModule, FuseThemeOptionsModule } from '@fuse/components';
import { FuseModule } from '@fuse/fuse.module';
import { FuseSharedModule } from '@fuse/shared.module';
import { NgIdleKeepaliveModule } from '@ng-idle/keepalive';
import { StorageModule } from '@ngx-pwa/local-storage';
import { TranslateModule } from '@ngx-translate/core';
import { RxReactiveFormsModule } from '@rxweb/reactive-form-validators';
import { InMemoryWebApiModule } from 'angular-in-memory-web-api';
import { intersectionObserverPreset, LazyLoadImageModule } from 'ng-lazyload-image';
import { NgxImageZoomModule } from 'ngx-image-zoom';
import { NgxMaskModule } from 'ngx-mask';
import { MomentModule } from 'ngx-moment';
import { NgxPermissionsModule } from 'ngx-permissions';
import { QuillModule } from 'ngx-quill';
import * as numeral from 'numeral';
import { AngularFireModule } from '@angular/fire';
import { MatDialogModule } from '@angular/material/dialog';

import { environment } from '../environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { AppStoreModule } from './app-store.module';
import { AppComponent } from './app.component';
import { AppService, initPrivileges } from './app.service';
import { FakeDbService } from './fake-db/fake-db.service';
import { fuseConfig } from './fuse-config';
import { LayoutModule } from './layout/layout.module';
import { AuthInterceptor } from './main/pages/core/auth/auth.interceptor';
import { WINDOW_PROVIDERS } from './shared/helpers';
import { IconModule } from './shared/icon.module';
import { HttpConfigInterceptor } from './shared/interceptors/http-config.interceptor';
import { HttpErrorInterceptor } from './shared/interceptors/http-error.interceptor';
import { MaterialModule } from './shared/material.module';
import { SharedModule } from './shared/shared.module';


import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { MaintenanceDialogComponent } from './maintenance-dialog.component';

numeral.register('locale', 'id-sinbad', {
    delimiters: {
        thousands: '.',
        decimal: ','
    },
    abbreviations: {
        thousand: 'ribu',
        million: 'juta',
        billion: 'miliar',
        trillion: 'triliun'
    },
    ordinal: _ => {
        // http://mylanguages.org/indonesian_numbers.php
        // The oridnals work by adding a prefix "ke" to the number except for when the value is 1.
        // That is a special case value of "Pertama".
        // Because it isn't clear how to prefix values i've left this as '.' per other locales I've seen.
        return '.';
    },
    currency: {
        symbol: getCurrencySymbol('IDR', 'narrow')
    }
});

numeral.locale('id-sinbad');

registerLocaleData(localId, 'id');

@NgModule({
    declarations: [AppComponent, MaintenanceDialogComponent],
    entryComponents: [MaintenanceDialogComponent],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        HttpClientModule,
        AppRoutingModule,

        TranslateModule.forRoot({}),
        environment.production
            ? []
            : InMemoryWebApiModule.forRoot(FakeDbService, {
                  delay: 0,
                  passThruUnknownUrl: true
              }),

        // Material
        MaterialModule,
        MatDialogModule,

        // Icon
        IconModule,

        // Fuse modules
        FuseModule.forRoot(fuseConfig),
        FuseProgressBarModule,
        FuseSharedModule,
        FuseSidebarModule,
        FuseThemeOptionsModule,

        SharedModule,

        // Store
        AppStoreModule,

        AgmCoreModule.forRoot({
            apiKey: 'AIzaSyCysXfZnhUFnXQ_PGPqPEdeF2mGDl8Hs14',
            libraries: ['geometry', 'places']
        }),

        QuillModule.forRoot(),
        LeafletModule.forRoot(),
        RxReactiveFormsModule.forRoot(),

        StorageModule.forRoot({
            IDBNoWrap: true,
            IDBDBName: environment.production
                ? 'sellerCenter'
                : environment.staging
                ? 'sellerCenterStg'
                : 'sellerCenterDev',
            LSPrefix: environment.production
                ? 'sellercenter_'
                : environment.staging
                ? 'sellercenter_stg_'
                : 'sellercenter_dev_'
        }),

        MomentModule,
        LazyLoadImageModule.forRoot({ preset: intersectionObserverPreset }),
        NgxImageZoomModule.forRoot(),
        NgxMaskModule.forRoot(),
        NgIdleKeepaliveModule.forRoot(),
        NgxPermissionsModule.forRoot(),

        ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),

        // App modules
        LayoutModule,

        NgMultiSelectDropDownModule.forRoot(),
        AngularFireModule.initializeApp(environment.firebase),
        AngularFireDatabaseModule
    ],
    providers: [
        AppService,
        WINDOW_PROVIDERS,
        { provide: LOCALE_ID, useValue: 'id' },
        { provide: APP_INITIALIZER, useFactory: initPrivileges, deps: [AppService], multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: HttpConfigInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: HttpErrorInterceptor, multi: true }
    ],
    bootstrap: [AppComponent]
})
export class AppModule {}
