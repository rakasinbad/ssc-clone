// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.
// import { LOGROCKET_ID } from './envGlobal';

export const environment = {
    pageSize: 100,
    production: false,
    staging: false,
    hmr: false,
    environment: 'local',
    logRocketId: '',
    // logRocketId: 'fbtbt4/sinbad-seller-center',
    appVersion: 'GIT_TAG',
    appHash: 'GIT_COMMIT_SHORT',
    freshnessData: 60, // in seconds.
    pageSizeTable: [5, 10, 25, 50, 100],
    host: 'https://kong-dev.sinbad.web.id',
    hiddenMenu: [],
    microSiteHost: 'https://micro-dev.sinbad.web.id',
    firebase: {
        apiKey: "AIzaSyD34zSjk6wgjGeHf3ZXOZWppkrEfLzduzU",
        authDomain: "sinbad-development.firebaseapp.com",
        databaseURL: "https://sinbad-development-default-rtdb.asia-southeast1.firebasedatabase.app",
        projectId: "sinbad-development",
        storageBucket: "sinbad-development.appspot.com",
        messagingSenderId: "968992127937",
        appId: "1:968992127937:web:5cf0f95b0e43a252614d40",
        measurementId: "G-65VNLCPDNB"
    }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
