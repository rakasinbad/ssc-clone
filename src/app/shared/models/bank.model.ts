export interface IUserBank {
    id?: string,
    name?: string,
    branch?: string,
    accountNo?: string,
    accountName?: string,
    isVerified?: boolean
}

export class UserBank implements IUserBank{
    id?: string;
    name?: string;
    branch?: string;
    accountNo?: string;
    accountName?: string;
    isVerified?: boolean;

    constructor({
        id,
        name,
        branch,
        accountNo,
        accountName,
        isVerified
    }: IUserBank){
        this.id = id;
        this.name = name;
        this.branch = branch;
        this.accountNo = accountNo;
        this.accountName = accountName;
        this.isVerified = isVerified;
    }
}