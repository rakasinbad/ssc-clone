import 'hammerjs';

import { AgmCoreModule } from '@agm/core';
import { registerLocaleData } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import localId from '@angular/common/locales/id';
import { LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ServiceWorkerModule } from '@angular/service-worker';
import { FuseProgressBarModule, FuseSidebarModule, FuseThemeOptionsModule } from '@fuse/components';
import { FuseModule } from '@fuse/fuse.module';
import { FuseSharedModule } from '@fuse/shared.module';
import { NgIdleKeepaliveModule } from '@ng-idle/keepalive';
import { EffectsModule } from '@ngrx/effects';
import { RouterState, StoreRouterConnectingModule } from '@ngrx/router-store';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { StorageModule } from '@ngx-pwa/local-storage';
import { TranslateModule } from '@ngx-translate/core';
import { RxReactiveFormsModule } from '@rxweb/reactive-form-validators';
import { InMemoryWebApiModule } from 'angular-in-memory-web-api';
import { MomentModule } from 'ngx-moment';
import { NgxPermissionsModule } from 'ngx-permissions';

import { environment } from '../environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FakeDbService } from './fake-db/fake-db.service';
import { fuseConfig } from './fuse-config';
import { LayoutModule } from './layout/layout.module';
import { AuthInterceptor } from './main/pages/core/auth/auth.interceptor';
import { AuthEffects } from './main/pages/core/auth/store/effects/auth.effects';
import { HttpConfigInterceptor } from './shared/interceptors/http-config.interceptor';
import { HttpErrorInterceptor } from './shared/interceptors/http-error.interceptor';
import { MaterialModule } from './shared/material.module';
import { SharedModule } from './shared/shared.module';
import { DropdownEffects } from './shared/store/effects/dropdown.effects';
import { NetworkEffects } from './shared/store/effects/network.effects';
import * as fromRoot from './store/app.reducer';
import { CustomSerializer } from './store/custom-serializer';

registerLocaleData(localId, 'id');

@NgModule({
    declarations: [AppComponent],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        HttpClientModule,
        AppRoutingModule,

        TranslateModule.forRoot({}),
        InMemoryWebApiModule.forRoot(FakeDbService, {
            delay: 0,
            passThruUnknownUrl: true
        }),

        // Material
        MaterialModule,

        // Fuse modules
        FuseModule.forRoot(fuseConfig),
        FuseProgressBarModule,
        FuseSharedModule,
        FuseSidebarModule,
        FuseThemeOptionsModule,

        SharedModule,

        AgmCoreModule.forRoot({
            // apiKey: 'AIzaSyAYbXdwC3U-zzUFkSVNIq7-xEO_ika4B98'
            apiKey: 'AIzaSyCJOq7jyP66ozbV2hXxLaTE_B9sx_y06vg'
        }),
        RxReactiveFormsModule.forRoot(),

        StoreModule.forRoot(fromRoot.appReducer, {
            metaReducers: fromRoot.metaReducers,
            runtimeChecks: {
                strictStateImmutability: true,
                strictActionImmutability: true,
                strictStateSerializability: true,
                strictActionSerializability: true
            }
        }),
        EffectsModule.forRoot([AuthEffects, NetworkEffects, DropdownEffects]),
        StoreDevtoolsModule.instrument({
            name: 'NgRx Sinbad Seller Center',
            logOnly: environment.production
        }),
        StoreRouterConnectingModule.forRoot({
            stateKey: 'router',
            serializer: CustomSerializer,
            routerState: RouterState.Minimal
        }),

        StorageModule.forRoot({
            IDBNoWrap: true
        }),

        MomentModule,
        NgIdleKeepaliveModule.forRoot(),
        NgxPermissionsModule.forRoot(),

        ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),

        // App modules
        LayoutModule
    ],
    providers: [
        { provide: LOCALE_ID, useValue: 'id' },
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: HttpConfigInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: HttpErrorInterceptor, multi: true }
    ],
    bootstrap: [AppComponent]
})
export class AppModule {}
