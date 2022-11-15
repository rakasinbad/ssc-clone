export const environment = {
    pageSize: 50,
    production: false,
    staging: true,
    hmr: false,
    environment: 'sandbox',
    logRocketId: 'fbtbt4/sinbad-seller-center',
    appVersion: 'GIT_TAG',
    appHash: 'GIT_COMMIT_SHORT',
    freshnessData: 60, // in seconds.
    pageSizeTable: [5, 10, 25, 50],
    host: 'https://kong-sandbox.sinbad.web.id',
    hiddenMenu: [
        'dashboard',
        // 'voucher', // Supplier Voucher
        // 'promo',
        // 'warehouse',
    ],
    microSiteHost: 'https://micro-sandbox.sinbad.web.id',
    firebase: {
        apiKey: "AIzaSyCqfOrEqN_vhpDThHwl-qxpw-YDrQksD8c",
        authDomain: "sinbad-sandbox-308107.firebaseapp.com",
        databaseURL: "https://sinbad-sandbox-308107-default-rtdb.asia-southeast1.firebasedatabase.app",
        projectId: "sinbad-sandbox-308107",
        storageBucket: "sinbad-sandbox-308107.appspot.com",
        messagingSenderId: "902977508851",
        appId: "1:902977508851:web:ced1d4ed5ba819f22eee86",
        measurementId: "G-K376KX0R81"
    },
    isSingleSpa: true
};