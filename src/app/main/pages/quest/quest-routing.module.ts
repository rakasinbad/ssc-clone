import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../core/auth/auth.guard';
import { QuestComponent } from './quest.component';

const routes: Routes = [{ path: '', component: QuestComponent, canActivate: [AuthGuard] }];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class QuestRoutingModule {}
