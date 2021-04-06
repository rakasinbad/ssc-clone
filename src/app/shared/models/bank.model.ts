export interface IUserBank {
    id?: string,
    name?: string,
    branchName?: string,
    accountNo?: string,
    accountName?: string,
    isVerified?: boolean
}

export class UserBank implements IUserBank{
    id?: string;
    name?: string;
    branchName?: string;
    accountNo?: string;
    accountName?: string;
    isVerified?: boolean;

    constructor({
        id,
        name,
        branchName,
        accountNo,
        accountName,
        isVerified
    }: IUserBank){
        this.id = id;
        this.name = name;
        this.branchName = branchName;
        this.accountNo = accountNo;
        this.accountName = accountName;
        this.isVerified = isVerified;
    }
}