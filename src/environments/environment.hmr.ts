export const environment = {
    pageSize: 5,
    production: false,
    staging: true,
    hmr: false,
    environment: 'staging',
    logRocketId: 'fbtbt4/sinbad-seller-center',
    appVersion: 'GIT_TAG',
    appHash: 'GIT_COMMIT_SHORT',
    freshnessData: 60, // in seconds.
    pageSizeTable: [5, 10, 25, 50],
    host: 'https://kong-dev.sinbad.web.id',
    hiddenMenu: [
        'dashboard',
        // 'voucher', // Supplier Voucher
        // 'promo',
        // 'warehouse',
    ],
    microSiteHost: 'https://micro-stg.sinbad.web.id',
    firebase: {
        apiKey: "AIzaSyD1Gfa1FCROwDiKkxxVOIV9fLtcr7wbTR0",
        authDomain: "sinbad-staging.firebaseapp.com",
        databaseURL: "https://sinbad-staging-default-rtdb.asia-southeast1.firebasedatabase.app",
        projectId: "sinbad-staging",
        storageBucket: "sinbad-staging.appspot.com",
        messagingSenderId: "257988437273",
        appId: "1:257988437273:web:6ff57abf77df357a2b9188",
        measurementId: "G-VNJMV0HHZY"
    },
};