// import { LOGROCKET_ID } from './envGlobal';

export const environment = {
    pageSize: 50,
    production: false,
    staging: true,
    hmr: false,
    environment: 'staging',
    logRocketId: 'fbtbt4/sinbad-seller-center',
    appVersion: '',
    appHash: '',
    freshnessData: 60, // in seconds.
    pageSizeTable: [5, 10, 25, 50],
    host: 'https://kong-stg.sinbad.web.id',
    hiddenMenu: [
        'dashboard',
        // 'voucher', // Supplier Voucher
        // 'promo',
        // 'warehouse',
    ],
};
