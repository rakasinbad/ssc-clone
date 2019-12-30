import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RxReactiveFormsModule } from '@rxweb/reactive-form-validators';

import { MaterialModule } from 'app/shared/material.module';
import { SharedModule } from 'app/shared/shared.module';

import { AssociationsRoutingModule } from './associations-routing.module';
import { AssociationsComponent } from './associations.component';

@NgModule({
    declarations: [AssociationsComponent],
    imports: [
        CommonModule,
        SharedModule,
        RxReactiveFormsModule,
        AssociationsRoutingModule,
        MaterialModule
    ]
})
export class AssociationsModule {}
