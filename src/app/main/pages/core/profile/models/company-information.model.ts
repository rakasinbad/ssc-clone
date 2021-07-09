export interface ICompanyInformation {
    companyInfo: {
        imageLogoUrl: string;
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
    companyInfo: {
        imageLogoUrl: string;
        name: string;
        description: string;
        country: string;
        businessType: 'supplier' | 'distributor';
        businessEntity: 'CV' | 'PT' | 'Tbk';
        since: number;
        numberOfEmployee: number;
    };

    constructor(data: ICompanyInformation) {
        const { companyInfo } = data;

        this.companyInfo = companyInfo;
    }
}
