export class CataloguePromo  {
   catalogueId: string;
   catalogueName: string;

   constructor(data: CataloguePromo) {
    const {
        catalogueId,
        catalogueName
    } = data;

    this.catalogueId = catalogueId;
    this.catalogueName = catalogueName;
    }
}