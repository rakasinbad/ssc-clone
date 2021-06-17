export interface ICompanyInformation {
    companyInformation: {
        imageUrl: string;
        name: string;
        description: string;
        country: string;
        businessType: 'supplier' | 'distributor';
        businessEntity: 'CV' | 'PT' | 'Tbk';
        since: number;
        numberOfEmployee: number;
    };
}

export class CompanyInformation implements ICompanyInformation {
    companyInformation: {
        imageUrl: string;
        name: string;
        description: string;
        country: string;
        businessType: 'supplier' | 'distributor';
        businessEntity: 'CV' | 'PT' | 'Tbk';
        since: number;
        numberOfEmployee: number;
    };

    constructor(data: ICompanyInformation) {
        const { companyInformation } = data;

        this.companyInformation = companyInformation;
    }
}
