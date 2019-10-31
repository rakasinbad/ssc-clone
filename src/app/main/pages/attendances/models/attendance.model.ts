import { IResponsePaginate, ITimestamp, Timestamp, TNullable } from 'app/shared/models';

import { AccountAssocAttendance } from '../../accounts/models/account.model';

export interface IAttendance extends ITimestamp {
    id: string;
    checkDate: string;
    longitudeCheckIn: TNullable<number>;
    latitudeCheckIn: TNullable<number>;
    longitudeCheckOut: TNullable<number>;
    latitudeCheckOut: TNullable<number>;
    checkIn: TNullable<string>;
    checkOut: TNullable<string>;
    userId?: TNullable<string>;
    user?: AccountAssocAttendance;
}

export interface IAttendanceResponse extends IResponsePaginate {
    data: IAttendance[];
}

export class Attendance extends Timestamp {
    id: string;
    checkDate: string;
    longitudeCheckIn: TNullable<number>;
    latitudeCheckIn: TNullable<number>;
    longitudeCheckOut: TNullable<number>;
    latitudeCheckOut: TNullable<number>;
    checkIn: TNullable<string>;
    checkOut: TNullable<string>;
    userId: TNullable<string>;
    user: AccountAssocAttendance;

    constructor(
        id: string,
        checkDate: string,
        longitudeCheckIn: TNullable<number>,
        latitudeCheckIn: TNullable<number>,
        longitudeCheckOut: TNullable<number>,
        latitudeCheckOut: TNullable<number>,
        checkIn: TNullable<string>,
        checkOut: TNullable<string>,
        userId: TNullable<string>,
        user: AccountAssocAttendance,
        createdAt: TNullable<string>,
        updatedAt: TNullable<string>,
        deletedAt: TNullable<string>
    ) {
        super(createdAt, updatedAt, deletedAt);

        this.id = id || undefined;
        this.checkDate = checkDate;
        this.longitudeCheckIn = longitudeCheckIn;
        this.latitudeCheckIn = latitudeCheckIn;
        this.longitudeCheckOut = longitudeCheckOut;
        this.latitudeCheckOut = latitudeCheckOut;
        this.checkIn = checkIn;
        this.checkOut = checkOut;

        this.userId = userId;
        this.user = user
            ? {
                  ...new AccountAssocAttendance(
                      user.id,
                      user.fullname,
                      user.email,
                      user.phoneNo,
                      user.mobilePhoneNo,
                      user.fcm,
                      user.status,
                      user.image,
                      user.urbanId,
                      user.userOdooId,
                      user.userStores,
                      user.roles,
                      user.createdAt,
                      user.updatedAt,
                      user.deletedAt
                  )
              }
            : null;

        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
    }
}

export class AttendanceAssocUser extends Timestamp {
    id: string;
    checkDate: string;
    longitudeCheckIn: TNullable<number>;
    latitudeCheckIn: TNullable<number>;
    longitudeCheckOut: TNullable<number>;
    latitudeCheckOut: TNullable<number>;
    checkIn: TNullable<string>;
    checkOut: TNullable<string>;

    constructor(
        id: string,
        checkDate: string,
        longitudeCheckIn: TNullable<number>,
        latitudeCheckIn: TNullable<number>,
        longitudeCheckOut: TNullable<number>,
        latitudeCheckOut: TNullable<number>,
        checkIn: TNullable<string>,
        checkOut: TNullable<string>,
        createdAt: TNullable<string>,
        updatedAt: TNullable<string>,
        deletedAt: TNullable<string>
    ) {
        super(createdAt, updatedAt, deletedAt);

        this.id = id || undefined;
        this.checkDate = checkDate;
        this.longitudeCheckIn = longitudeCheckIn;
        this.latitudeCheckIn = latitudeCheckIn;
        this.longitudeCheckOut = longitudeCheckOut;
        this.latitudeCheckOut = latitudeCheckOut;
        this.checkIn = checkIn;
        this.checkOut = checkOut;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
    }
}
