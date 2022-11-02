import { ButtonDesignType } from 'app/shared/models/button.model';
import { IDialogConfig } from 'app/shared/models/dialog.model';
import { ITab } from 'app/shared/models/tab.model';

export interface IButtonExportConfig {
    readonly id: NonNullable<string>;
    color?: string;
    cssClass?: string | Array<string>;
    dialogConf: IDialogConfig;
    title: string;
    type: ButtonDesignType;
}

export interface IDialogData {
    dialog: {
        title: string;
        cssToolbar: string | Array<string>;
    };
    pageType: string;
    formConfig: any;
    tabConfig: Array<ITab>;
}

interface IExport {
    message: string
}

export class ExportAdvanced implements IExport {
    message: string;

    constructor(data: IExport) {
        const { message } = data;

        this.message = message;
    }
}
