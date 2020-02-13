// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
    pageSize: 100,
    production: false,
    staging: false,
    hmr: false,
    // Untuk meletakkan versi app.
    appVersion: '',
    // Untuk meletakkan short commit hash terakhir.
    appHash: '',
    freshnessData: 60, // in seconds.
    pageSizeTable: [5, 10, 25, 50, 100],
    host: 'https://kong-dev.sinbad.web.id'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
