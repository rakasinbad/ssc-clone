// import { LOGROCKET_ID } from './envGlobal';

export const environment = {
    pageSize: 50,
    production: true,
    staging: false,
    hmr: false,
    environment: 'production',
    logRocketId: 'fbtbt4/sinbad-seller-center',
    appVersion: 'GIT_TAG',
    appHash: 'GIT_COMMIT_SHORT',
    freshnessData: 60, // in seconds.
    pageSizeTable: [5, 10, 25, 50],
    host: 'https://kong.sinbad.web.id',
    hiddenMenu: [
        'dashboard',
        'period-target-promo', // Period Target Promo
    ],
    microSiteHost: 'https://micro.sinbad.web.id',
};
