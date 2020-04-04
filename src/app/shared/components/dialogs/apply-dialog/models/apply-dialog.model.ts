import { TemplateRef } from '@angular/core';

export interface ApplyDialog {
    title: string;
    template: TemplateRef<any>;
    isApplyEnabled: boolean;
}
