import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ErrorsComponent } from './errors.component';

const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: '',
                component: ErrorsComponent
            },
            {
                path: '404',
                loadChildren: () => import('./404/error-404.module').then(m => m.Error404Module)
            },
            {
                path: '403',
                loadChildren: () => import('./403/error-403.module').then(m => m.Error403Module)
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ErrorsRoutingModule {}
