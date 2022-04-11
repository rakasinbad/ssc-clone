export type MssSettingsAction = 'insert' | 'delete' | 'update';
export interface ICatalogueMssSettings {
  id: string;
  referenceId: string;
  referenceName?: string;
  mssTypeId: string;
  mssTypeName?: string;
  action?: MssSettingsAction;
}

export class CatalogueMssSettings implements ICatalogueMssSettings {
  id: string;
  referenceId: string;
  referenceName?: string;
  mssTypeId: string;
  mssTypeName?: string;
  action?: MssSettingsAction;

  constructor(data: ICatalogueMssSettings) {
    this.id = data.id;
    this.referenceName = data.referenceName;
    this.referenceId = data.referenceId;
    this.mssTypeId = data.mssTypeId;
    this.mssTypeName = data.mssTypeName;
    this.action = data.action;
  }
}

export interface IUpsertMssSettings {
  supplierId: number;
  catalogueId: number;
  data: ICatalogueMssSettings[];
}

export class UpsertMssSettings implements IUpsertMssSettings {
  supplierId: number;
  catalogueId: number;
  data: ICatalogueMssSettings[];

  constructor(data: IUpsertMssSettings) {
    this.supplierId = data.supplierId;
    this.catalogueId = data.catalogueId;
    this.data = data.data;
  }
}
