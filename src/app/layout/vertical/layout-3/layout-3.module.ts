import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FuseSidebarModule } from '@fuse/components';
import { FuseSharedModule } from '@fuse/shared.module';
import { ContentModule } from 'app/layout/components/content/content.module';
import { FooterModule } from 'app/layout/components/footer/footer.module';
import { NavbarModule } from 'app/layout/components/navbar/navbar.module';
import { QuickPanelModule } from 'app/layout/components/quick-panel/quick-panel.module';
import { ToolbarModule } from 'app/layout/components/toolbar/toolbar.module';
import { VerticalLayout3Component } from 'app/layout/vertical/layout-3/layout-3.component';

import { FooterActionModule } from './../../components/footer-action/footer-action.module';

// import { AccountMerchantQuickPanelModule } from 'app/main/pages/accounts/account-detail/account-merchant-quick-panel/account-merchant-quick-panel.module';

@NgModule({
    declarations: [VerticalLayout3Component],
    imports: [
        RouterModule,

        FuseSharedModule,
        FuseSidebarModule,

        ContentModule,
        FooterModule,
        NavbarModule,
        QuickPanelModule,
        ToolbarModule,

        FooterActionModule
        // AccountMerchantQuickPanelModule
    ],
    exports: [VerticalLayout3Component]
})
export class VerticalLayout3Module {}
