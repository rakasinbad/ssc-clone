import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material';
import { ResponseRoutingModule } from './response-routing.module';
import { ResponseComponent } from './response.component';

@NgModule({
    declarations: [ResponseComponent],
    imports: [CommonModule, MatProgressSpinnerModule, ResponseRoutingModule],
})
export class ResponseModule {}
