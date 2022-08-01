import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatIconRegistry } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';
import { assetUrl } from 'single-spa/asset-url';

/**
 *
 *
 * @export
 * @class IconModule
 */
@NgModule({
    declarations: [],
    imports: [CommonModule],
})
export class IconModule {
    /**
     * Creates an instance of IconModule.
     * @param {MatIconRegistry} matIconRegistry
     * @param {DomSanitizer} domSanitizer
     * @memberof IconModule
     */
    constructor(private matIconRegistry: MatIconRegistry, private domSanitizer: DomSanitizer) {
        // -----------------------------------------------------------------------------------------------------
        // @ Other sources
        // -----------------------------------------------------------------------------------------------------

        // Coin
        this.matIconRegistry.addSvgIcon(
            'icons8-coin',
            this.domSanitizer.bypassSecurityTrustResourceUrl(assetUrl('./icons/icons8/coin.svg'))
        );

        // Money
        this.matIconRegistry.addSvgIcon(
            'icons8-money',
            this.domSanitizer.bypassSecurityTrustResourceUrl(assetUrl('./icons/icons8/money.svg'))
        );

        // Open Box
        this.matIconRegistry.addSvgIcon(
            'icons8-open-box',
            this.domSanitizer.bypassSecurityTrustResourceUrl(assetUrl('./icons/icons8/open-box.svg'))
        );

        // Paper Money
        this.matIconRegistry.addSvgIcon(
            'icons8-paper-money',
            this.domSanitizer.bypassSecurityTrustResourceUrl(assetUrl('./icons/icons8/paper-money.svg'))
        );

        // Stack Money
        this.matIconRegistry.addSvgIcon(
            'icons8-stack-money',
            this.domSanitizer.bypassSecurityTrustResourceUrl(assetUrl('./icons/icons8/stack-money.svg'))
        );

        // -----------------------------------------------------------------------------------------------------
        // @ Sinbad sources
        // -----------------------------------------------------------------------------------------------------

        // Attendance logo - packed box
        this.matIconRegistry.addSvgIcon(
            'sinbad-attendance-logo',
            this.domSanitizer.bypassSecurityTrustResourceUrl(assetUrl('./icons/sinbad/attendance-logo.svg'))
        );

        // Catalogue logo - packed box
        this.matIconRegistry.addSvgIcon(
            'sinbad-catalogue-logo',
            this.domSanitizer.bypassSecurityTrustResourceUrl(assetUrl('./icons/sinbad/catalogue-logo.svg'))
        );

        // Check active - packed box
        this.matIconRegistry.addSvgIcon(
            'sinbad-check-active',
            this.domSanitizer.bypassSecurityTrustResourceUrl(assetUrl('./icons/sinbad/check-active.svg'))
        );

        // Check inactive - packed box
        this.matIconRegistry.addSvgIcon(
            'sinbad-check-inactive',
            this.domSanitizer.bypassSecurityTrustResourceUrl(assetUrl('./icons/sinbad/check-inactive.svg'))
        );

        // Cross red - packed box
        this.matIconRegistry.addSvgIcon(
            'sinbad-cross-red',
            this.domSanitizer.bypassSecurityTrustResourceUrl(assetUrl('./icons/sinbad/cross-red.svg'))
        );

        // Dashboard Logo - packed box
        this.matIconRegistry.addSvgIcon(
            'sinbad-dashboard-logo',
            this.domSanitizer.bypassSecurityTrustResourceUrl(assetUrl('./icons/sinbad/dashboard.svg'))
        );

        // Finance logo - packed box
        this.matIconRegistry.addSvgIcon(
            'sinbad-finance-logo',
            this.domSanitizer.bypassSecurityTrustResourceUrl(assetUrl('./icons/sinbad/finance-logo.svg'))
        );

        // Inventory logo - packed box
        this.matIconRegistry.addSvgIcon(
            'sinbad-inventory-logo',
            this.domSanitizer.bypassSecurityTrustResourceUrl(assetUrl('./icons/sinbad/inventory-logo.svg'))
        );

        // Logistics logo - packed box
        this.matIconRegistry.addSvgIcon(
            'sinbad-logistics',
            this.domSanitizer.bypassSecurityTrustResourceUrl(assetUrl('./icons/sinbad/logistics.svg'))
        );

        // OMS logo - packed box
        this.matIconRegistry.addSvgIcon(
            'sinbad-oms-logo',
            this.domSanitizer.bypassSecurityTrustResourceUrl(assetUrl('./icons/sinbad/oms-logo.svg'))
        );

        this.matIconRegistry.addSvgIcon(
            'sinbad-return',
            this.domSanitizer.bypassSecurityTrustResourceUrl(assetUrl('./icons/sinbad/return-product.svg'))
        );

        // On Process logo - packed box
        this.matIconRegistry.addSvgIcon(
            'sinbad-on-process',
            this.domSanitizer.bypassSecurityTrustResourceUrl(assetUrl('./icons/sinbad/on_process.svg'))
        );

        // Pending logo - packed box
        this.matIconRegistry.addSvgIcon(
            'sinbad-pending',
            this.domSanitizer.bypassSecurityTrustResourceUrl(assetUrl('./icons/sinbad/pending.svg'))
        );

        // Promo Logo - packed box
        this.matIconRegistry.addSvgIcon(
            'sinbad-promo-logo',
            this.domSanitizer.bypassSecurityTrustResourceUrl(assetUrl('./icons/sinbad/local_play.svg'))
        );

        // Sales Force logo - packed box
        this.matIconRegistry.addSvgIcon(
            'sinbad-sales-force-logo',
            this.domSanitizer.bypassSecurityTrustResourceUrl(assetUrl('./icons/sinbad/sales-force-logo.svg'))
        );

        // Store logo - packed box
        this.matIconRegistry.addSvgIcon(
            'sinbad-store-logo',
            this.domSanitizer.bypassSecurityTrustResourceUrl(assetUrl('./icons/sinbad/store-logo.svg'))
        );

        // Survey logo - packed box
        this.matIconRegistry.addSvgIcon(
            'sinbad-survey-logo',
            this.domSanitizer.bypassSecurityTrustResourceUrl(assetUrl('./icons/sinbad/survey-icon.svg'))
        );

        // SKP Logo - packed box
        this.matIconRegistry.addSvgIcon(
            'sinbad-skp-logo',
            this.domSanitizer.bypassSecurityTrustResourceUrl(assetUrl('./icons/sinbad/skp-logo.svg'))
        );

        // Info logo - packed box
          this.matIconRegistry.addSvgIcon(
            'sinbad-info',
            this.domSanitizer.bypassSecurityTrustResourceUrl(assetUrl('./icons/sinbad/info.svg'))
          );

        // Info 2 logo - icon color blue
        this.matIconRegistry.addSvgIcon(
            'sinbad-info-2',
            this.domSanitizer.bypassSecurityTrustResourceUrl(assetUrl('./icons/sinbad/info-2.svg'))
        );

        // quest
          this.matIconRegistry.addSvgIcon(
            'sinbad-quest-logo',
            this.domSanitizer.bypassSecurityTrustResourceUrl(assetUrl('./icons/sinbad/quest.svg'))
        );

        // timeline check
        this.matIconRegistry.addSvgIcon(
            'sinbad-check-red',
            this.domSanitizer.bypassSecurityTrustResourceUrl(assetUrl('./icons/sinbad/check-red.svg'))
        );
    }
}
