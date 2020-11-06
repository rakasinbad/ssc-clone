import { NgModule } from '@angular/core';
import { BackButtonDirective } from './directives';

@NgModule({
    declarations: [BackButtonDirective],
    exports: [BackButtonDirective],
})
export class DirectiveSharedModule {}
