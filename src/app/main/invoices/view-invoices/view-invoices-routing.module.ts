import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ViewInvoicesComponent } from './view-invoices.component';

const routes: Routes = [
    {
        path: '',
        component: ViewInvoicesComponent
    }
];

/**
 *
 *
 * @export
 * @class ViewInvoicesRoutingModule
 */
@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ViewInvoicesRoutingModule {}
