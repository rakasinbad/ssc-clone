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
            this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/icons8/coin.svg')
        );

        // Money
        this.matIconRegistry.addSvgIcon(
            'icons8-money',
            this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/icons8/money.svg')
        );

        // Open Box
        this.matIconRegistry.addSvgIcon(
            'icons8-open-box',
            this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/icons8/open-box.svg')
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

        // -----------------------------------------------------------------------------------------------------
        // @ Sinbad sources
        // -----------------------------------------------------------------------------------------------------

        // Attendance logo - packed box
        this.matIconRegistry.addSvgIcon(
            'sinbad-attendance-logo',
            this.domSanitizer.bypassSecurityTrustResourceUrl(
                './assets/icons/sinbad/attendance-logo.svg'
            )
        );

        // Catalogue logo - packed box
        this.matIconRegistry.addSvgIcon(
            'sinbad-catalogue-logo',
            this.domSanitizer.bypassSecurityTrustResourceUrl(
                './assets/icons/sinbad/catalogue-logo.svg'
            )
        );

        // Check active - packed box
        this.matIconRegistry.addSvgIcon(
            'sinbad-check-active',
            this.domSanitizer.bypassSecurityTrustResourceUrl(
                './assets/icons/sinbad/check-active.svg'
            )
        );

        // Check inactive - packed box
        this.matIconRegistry.addSvgIcon(
            'sinbad-check-inactive',
            this.domSanitizer.bypassSecurityTrustResourceUrl(
                './assets/icons/sinbad/check-inactive.svg'
            )
        );

        // Cross red - packed box
        this.matIconRegistry.addSvgIcon(
            'sinbad-cross-red',
            this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/sinbad/cross-red.svg')
        );

        // Dashboard Logo - packed box
        this.matIconRegistry.addSvgIcon(
            'sinbad-dashboard-logo',
            this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/sinbad/dashboard.svg')
        );

        // Finance logo - packed box
        this.matIconRegistry.addSvgIcon(
            'sinbad-finance-logo',
            this.domSanitizer.bypassSecurityTrustResourceUrl(
                './assets/icons/sinbad/finance-logo.svg'
            )
        );

        // Inventory logo - packed box
        this.matIconRegistry.addSvgIcon(
            'sinbad-inventory-logo',
            this.domSanitizer.bypassSecurityTrustResourceUrl(
                './assets/icons/sinbad/inventory-logo.svg'
            )
        );

        // Logistics logo - packed box
        this.matIconRegistry.addSvgIcon(
            'sinbad-logistics',
            this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/sinbad/logistics.svg')
        );

        // OMS logo - packed box
        this.matIconRegistry.addSvgIcon(
            'sinbad-oms-logo',
            this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/sinbad/oms-logo.svg')
        );

        // On Process logo - packed box
        this.matIconRegistry.addSvgIcon(
            'sinbad-on-process',
            this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/sinbad/on_process.svg')
        );

        // Pending logo - packed box
        this.matIconRegistry.addSvgIcon(
            'sinbad-pending',
            this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/sinbad/pending.svg')
        );

        // Promo Logo - packed box
        this.matIconRegistry.addSvgIcon(
            'sinbad-promo-logo',
            this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/sinbad/local_play.svg')
        );

        // Sales Force logo - packed box
        this.matIconRegistry.addSvgIcon(
            'sinbad-sales-force-logo',
            this.domSanitizer.bypassSecurityTrustResourceUrl(
                './assets/icons/sinbad/sales-force-logo.svg'
            )
        );

        // Store logo - packed box
        this.matIconRegistry.addSvgIcon(
            'sinbad-store-logo',
            this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/sinbad/store-logo.svg')
        );

        // Survey logo - packed box
        this.matIconRegistry.addSvgIcon(
            'sinbad-survey-logo',
            this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/sinbad/survey-icon.svg')
        );

        // SKP Logo - packed box
        this.matIconRegistry.addSvgIcon(
            'sinbad-skp-logo',
            this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/sinbad/skp-logo.svg')
        );

        // Info logo - packed box
          this.matIconRegistry.addSvgIcon(
            'sinbad-info',
            this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/sinbad/info.svg')
          );

        // quest
          this.matIconRegistry.addSvgIcon(
            'sinbad-quest-logo',
            this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/sinbad/quest.svg')
        );
    }
}
