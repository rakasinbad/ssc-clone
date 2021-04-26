import { HelperService } from "app/shared/helpers";

export interface IInternalEmployeeDetails {
    id:            number;
    imageUrl:    string;
    fullName:      string;
    email:         string;
    mobilePhoneNo: string;
    roleNames:     string;
    roleIds:       number[];
    platform:      string;
    privileges:    string;
}

export class InternalEmployeeDetails implements IInternalEmployeeDetails{
    id: number;
    imageUrl: string;
    fullName: string;
    email: string;
    mobilePhoneNo: string;
    roleNames: string;
    roleIds: number[];
    platform: string;
    privileges: string;

    constructor(data :IInternalEmployeeDetails){
        const {
            id,
            imageUrl,
            fullName,
            email,
            mobilePhoneNo,
            roleNames,
            roleIds,
            platform,
            privileges
        } = data;

        HelperService.debug("RESPONSE", data);

        this.id = id;
        this.imageUrl = imageUrl;
        this.fullName = fullName;
        this.email = email;
        this.mobilePhoneNo = mobilePhoneNo;
        this.roleNames = roleNames;
        this.roleIds = roleIds;
        this.platform = platform;
        this.privileges = privileges;
    }
}