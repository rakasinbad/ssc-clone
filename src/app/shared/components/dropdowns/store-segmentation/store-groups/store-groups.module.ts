import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FuseSharedModule } from '@fuse/shared.module';
import { MatAutocompleteModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule } from '@angular/material';
import { StoreGroupsDropdownComponent } from './store-groups.component';
import { RxReactiveFormsModule } from '@rxweb/reactive-form-validators';
import { RxReactiveDynamicFormsModule } from '@rxweb/reactive-dynamic-forms';



@NgModule({
    declarations: [
        StoreGroupsDropdownComponent,
    ],
    imports: [
        CommonModule,

        // Fuse
        FuseSharedModule,

        // Material
        MatAutocompleteModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,

        // Third Party (RxWeb: https://www.rxweb.io)
        RxReactiveFormsModule,
        RxReactiveDynamicFormsModule,
    ],
    exports: [
        StoreGroupsDropdownComponent,
    ],
    entryComponents: [
        StoreGroupsDropdownComponent,
    ],
})
export class StoreGroupsDropdownModule { }
