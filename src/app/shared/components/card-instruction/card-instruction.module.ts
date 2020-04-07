import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material';
import { FlexLayoutModule } from '@angular/flex-layout';

import { CardInstructionComponent } from './card-instruction.component';

@NgModule({
    declarations: [
        CardInstructionComponent,
    ],
    imports: [
        CommonModule,
        FlexLayoutModule,

        MatIconModule,
    ],
    exports: [
        CardInstructionComponent,
    ],
    entryComponents: [
        CardInstructionComponent,
    ]
})
export class CardInstructionModule { }
