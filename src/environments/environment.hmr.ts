import { LOGROCKET_ID } from './envGlobal';

export const environment = {
    pageSize: 100,
    production: false,
    staging: false,
    hmr: true,
    logRocketId: '',
    environment: 'local',
    // logRocketId: LOGROCKET_ID,
    appVersion: '',
    appHash: '',
    freshnessData: 60, // in seconds.
    pageSizeTable: [5, 10, 25, 50, 100],
    host: 'https://kong-dev.sinbad.web.id'
};
