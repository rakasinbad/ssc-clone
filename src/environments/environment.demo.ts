// import { LOGROCKET_ID } from './envGlobal';

export const environment = {
    pageSize: 50,
    production: false,
    staging: true,
    hmr: false,
    environment: 'demo',
    logRocketId: 'fbtbt4/sinbad-seller-center',
    appVersion: 'GIT_TAG',
    appHash: 'GIT_COMMIT_SHORT',
    freshnessData: 60, // in seconds.
    pageSizeTable: [5, 10, 25, 50],
    host: 'https://kong-demo.sinbad.web.id',
    hiddenMenu: [
        'dashboard',
        // 'warehouse',
    ],
    microSiteHost: 'https://micro-demo.sinbad.web.id',
};
