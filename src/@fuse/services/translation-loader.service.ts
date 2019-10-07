import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

/**
 *
 *
 * @export
 * @interface Locale
 */
export interface Locale {
    lang: string;
    data: Object;
}

/**
 *
 *
 * @export
 * @class FuseTranslationLoaderService
 */
@Injectable({
    providedIn: 'root'
})
export class FuseTranslationLoaderService {
    /**
     * Creates an instance of FuseTranslationLoaderService.
     * @param {TranslateService} _translateService
     * @memberof FuseTranslationLoaderService
     */
    constructor(private _translateService: TranslateService) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     *
     * Load translations
     * @param {...Locale[]} args
     * @memberof FuseTranslationLoaderService
     */
    loadTranslations(...args: Locale[]): void {
        const locales = [...args];

        locales.forEach(locale => {
            // use setTranslation() with the third argument set to true
            // to append translations instead of replacing them
            console.log(locale.lang, locale.data);
            this._translateService.setTranslation(locale.lang, locale.data, true);
        });
    }
}
