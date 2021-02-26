// Angular Core Libraries.
import { NgModule } from '@angular/core';

// Angular Routing Libraries
import { Routes, RouterModule } from '@angular/router';

// NgxPermissions Libraries.
import { NgxPermissionsGuard } from 'ngx-permissions';

// Auth Guard Core Libraries.
import { AuthGuard } from '../../core/auth/auth.guard';

// The component.
import { PromoHierarchyComponent } from './promo-hierarchy.component';
import { DetailPromoHierarchyComponent } from './components/detail-promo-hierarchy/detail-promo-hierarchy.component';
import { getRoleByRouter } from 'app/shared/helpers';

// Routes
const routes: Routes = [
    {
        path: '',
        component: PromoHierarchyComponent,
        canActivate: [AuthGuard, NgxPermissionsGuard],
        data: {
            permissions: {
                only: getRoleByRouter('promos', 'promo-hierarchy'),
                redirectTo: {
                    navigationCommands: ['/pages/errors/403'],
                    navigationExtras: {
                        replaceUrl: true,
                        skipLocationChange: true,
                    },
                },
            },
        },
    },
    {
        path: ':id/detail',
        component: DetailPromoHierarchyComponent,
        // canActivate: [AuthGuard, NgxPermissionsGuard],
        // data: {
        //     permissions: {
        //         only: getRoleByRouter('promos', 'promo-hierarchy'),
        //         redirectTo: {
        //             navigationCommands: ['/pages/errors/403'],
        //             navigationExtras: {
        //                 replaceUrl: true,
        //                 skipLocationChange: true,
        //             },
        //         },
        //     },
        // },
    },
    
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class PromoHierarchyRoutingModule {}
