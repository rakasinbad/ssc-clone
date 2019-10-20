import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '../../core/auth/auth.guard';
import { InternalDetailComponent } from './internal-detail/internal-detail.component';
import { InternalFormComponent } from './internal-form/internal-form.component';
import { InternalComponent } from './internal.component';
import { InternalDetailResolver, InternalResolver } from './resolvers';

const routes: Routes = [
    {
        path: '',
        component: InternalComponent,
        canActivate: [AuthGuard],
        resolve: {
            internals: InternalResolver
        }
    },
    {
        path: ':id',
        component: InternalFormComponent,
        canActivate: [AuthGuard]
    },
    {
        path: ':id/detail',
        component: InternalDetailComponent,
        canActivate: [AuthGuard],
        resolve: {
            internal: InternalDetailResolver
        }
    }
];

/**
 *
 *
 * @export
 * @class InternalRoutingModule
 */
@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class InternalRoutingModule {}
