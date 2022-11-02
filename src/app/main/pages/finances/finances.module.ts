import { NgModule } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';

import { FinancesRoutingModule } from './finances-routing.module';

@NgModule({
    imports: [FinancesRoutingModule, SharedModule]
})
export class FinancesModule {}
