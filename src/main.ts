import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from 'app/app.module';
import { environment } from 'environments/environment';
import { hmrBootstrap } from 'hmr';

if (environment.production) {
    const newrelic = document.createElement('script');
    newrelic.src = 'assets/js/newrelic.js';
    newrelic.type = 'text/javascript';
    document.head.appendChild(newrelic);

    enableProdMode();
}

const bootstrap = () => platformBrowserDynamic().bootstrapModule(AppModule);

if (environment.hmr) {
    if (module['hot']) {
        hmrBootstrap(module, bootstrap);
    } else {
        console.error('HMR is not enabled for webpack-dev-server!');
        console.log('Are you using the --hmr flag for ng serve?');
    }
} else {
    bootstrap().catch(err => console.error(err));
}
