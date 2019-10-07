import { NgModule } from '@angular/core';
import { FuseSharedModule } from '@fuse/shared.module';
import { MaterialModule } from 'app/shared/material.module';
import { AccountMerchantQuickPanelComponent } from './account-merchant-quick-panel.component';

@NgModule({
    declarations: [AccountMerchantQuickPanelComponent],
    imports: [MaterialModule, FuseSharedModule],
    exports: [AccountMerchantQuickPanelComponent]
})
export class AccountMerchantQuickPanelModule {}
