import { TemplateRef } from '@angular/core';

export interface ApplyDialog {
    title: string;
    template: TemplateRef<any>;
    isApplyEnabled: boolean;
    showApplyButton?: boolean;
    showCloseButton?: boolean;
    applyValue?: string;
    closeValue?: string;
}
