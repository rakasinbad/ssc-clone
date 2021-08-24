import { NgModule } from '@angular/core';
import { FuseSharedModule } from '@fuse/shared.module';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { AngularFireModule } from '@angular/fire';
import { environment } from '../../../../../environments/environment';

import { ErrorsRoutingModule } from './errors-routing.module';
import { ErrorsComponent } from './errors.component';

@NgModule({
    declarations: [ErrorsComponent],
    imports: [
        ErrorsRoutingModule, 
        FuseSharedModule,
        AngularFireModule.initializeApp(environment.firebase),
        AngularFireDatabaseModule
    ]
})
export class ErrorsModule {}
