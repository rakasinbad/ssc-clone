export interface ICatalogueMssSettingsSegmentation {
  id: string;
  name: string;
}

export class CatalogueMssSettingsSegmentation implements ICatalogueMssSettingsSegmentation {
  id: string;
  name: string;

  constructor(data: ICatalogueMssSettingsSegmentation) {
    this.id = data.id;
    this.name = data.name;
  }
}
