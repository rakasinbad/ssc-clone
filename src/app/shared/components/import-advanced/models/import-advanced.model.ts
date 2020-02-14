import { ButtonDesignType, IDialogConfig, ITab } from 'app/shared/models';

export interface IButtonImportConfig {
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
    formConfig: any;
    tabConfig: Array<ITab>;
}
