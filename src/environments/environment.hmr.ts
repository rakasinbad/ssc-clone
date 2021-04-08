// import { LOGROCKET_ID } from './envGlobal';

export const environment = {
    pageSize: 100,
    production: false,
    staging: false,
    hmr: true,
    logRocketId: '',
    environment: 'local',
    // logRocketId: 'fbtbt4/sinbad-seller-center',
    appVersion: 'GIT_TAG',
    appHash: 'GIT_COMMIT_SHORT',
    freshnessData: 60, // in seconds.
    pageSizeTable: [5, 10, 25, 50, 100],
    host: 'https://kong-stg.sinbad.web.id',
    hiddenMenu: [],
    microSiteHost: 'https://micro-dev.sinbad.web.id',
};
