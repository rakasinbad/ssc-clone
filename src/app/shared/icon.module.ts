import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatIconRegistry } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';

/**
 *
 *
 * @export
 * @class IconModule
 */
@NgModule({
    declarations: [],
    imports: [CommonModule]
})
export class IconModule {
    /**
     * Creates an instance of IconModule.
     * @param {MatIconRegistry} matIconRegistry
     * @param {DomSanitizer} domSanitizer
     * @memberof IconModule
     */
    constructor(private matIconRegistry: MatIconRegistry, private domSanitizer: DomSanitizer) {
        // Money
        this.matIconRegistry.addSvgIcon(
            'icons8-money',
            this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/icons8/money.svg')
        );

        // Paper Money
        this.matIconRegistry.addSvgIcon(
            'icons8-paper-money',
            this.domSanitizer.bypassSecurityTrustResourceUrl(
                './assets/icons/icons8/paper-money.svg'
            )
        );

        // Stack Money
        this.matIconRegistry.addSvgIcon(
            'icons8-stack-money',
            this.domSanitizer.bypassSecurityTrustResourceUrl(
                './assets/icons/icons8/stack-money.svg'
            )
        );

        // Coin
        this.matIconRegistry.addSvgIcon(
            'icons8-coin',
            this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/icons8/coin.svg')
        );

        // Open Box
        this.matIconRegistry.addSvgIcon(
            'icons8-open-box',
            this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/icons8/open-box.svg')
        );

        // Catalogue logo - packed box
        this.matIconRegistry.addSvgIcon(
            'sinbad-catalogue-logo',
            this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/sinbad/catalogue-logo.svg')
        );
    }
}
