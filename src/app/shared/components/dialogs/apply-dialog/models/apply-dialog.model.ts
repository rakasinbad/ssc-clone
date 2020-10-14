import { TemplateRef } from '@angular/core';

export interface ApplyDialog<T = undefined> {
    title: string;
    template: TemplateRef<any>;
    isApplyEnabled: boolean;
    showApplyButton?: boolean;
    showCloseButton?: boolean;
    applyValue?: string;
    closeValue?: string;
    contentClass?: Array<string>;
    handleEventManually?: boolean;
    context?: T;
}
