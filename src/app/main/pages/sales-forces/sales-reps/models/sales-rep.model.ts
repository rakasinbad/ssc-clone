import { EStatus, TNullable } from 'app/shared/models/global.model';
import { Supplier } from 'app/shared/models/supplier.model';
import { ITimestamp } from 'app/shared/models/timestamp.model';
import { User } from 'app/shared/models/user.model';

export interface ISalesRep extends ITimestamp {
    readonly id: NonNullable<string>;
    userId: string;
    supplierId: string;
    status: EStatus;
    supplier: Supplier;
    user: User;
}

export class SalesRep implements ISalesRep {
    readonly id: NonNullable<string>;
    userId: string;
    supplierId: string;
    status: EStatus;
    supplier: Supplier;
    user: User;
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;

    constructor(data: ISalesRep) {
        const {
            id,
            userId,
            supplierId,
            status = EStatus.INACTIVE,
            supplier,
            user,
            createdAt,
            updatedAt,
            deletedAt,
        } = data;

        this.id = id;
        this.userId = userId;
        this.supplierId = supplierId;
        this.status = status;
        this.setSupplier = supplier;
        this.setUser = user;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
    }

    set setSupplier(value: Supplier) {
        this.supplier = value ? new Supplier(value) : null;
    }

    set setUser(value: User) {
        this.user = value ? new User(value) : null;
    }
}

type AddForm = 'fullName' | 'mobilePhoneNo' | 'idNo';

interface ISalesRepForm {
    userCode: string;
    status: EStatus;
    image: string;
    supplierId: string;
    password: string;
    confPassword: string;
    saleTeamId: string;
}

interface ISalesRepOldPasswordForm {
    oldPassword: string;
}

export type SalesRepForm = Required<Pick<User, AddForm> & ISalesRepForm>;

export type SalesRepFormPatch = Partial<
    Pick<
        SalesRepForm,
        'userCode' | 'fullName' | 'mobilePhoneNo' | 'idNo' | 'status' | 'image' | 'saleTeamId'
    >
>;

export type SalesRepFormPasswordPut = Required<Pick<SalesRepForm, 'password' | 'confPassword'>>;

export enum SalesRepBatchActions {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    DELETE = 'delete',
}
