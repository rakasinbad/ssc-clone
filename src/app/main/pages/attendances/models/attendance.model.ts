import { IResponsePaginate, ITimestamp, Timestamp, TNullable } from 'app/shared/models';

import { AccountAssocAttendance } from '../../accounts/models/account.model';
import { Store } from '../../accounts/merchants/models';

type ELocationType = 'inside' | 'outside' | 'others';

type EAttendanceType = 'absent' | 'present' | 'leave';

export interface IAttendance extends ITimestamp {
    id: string;
    date: string;
    longitudeCheckIn: TNullable<number>;
    latitudeCheckIn: TNullable<number>;
    longitudeCheckOut: TNullable<number>;
    latitudeCheckOut: TNullable<number>;
    checkIn: TNullable<string>;
    checkOut: TNullable<string>;
    locationType: ELocationType;
    attendanceType: EAttendanceType;
    userId?: TNullable<string>;
    user?: AccountAssocAttendance;
}

export interface IAttendanceResponse extends IResponsePaginate {
    data: IAttendance[];
}

export class Attendance extends Timestamp {
    id: string;
    date: string;
    longitudeCheckIn: TNullable<number>;
    latitudeCheckIn: TNullable<number>;
    longitudeCheckOut: TNullable<number>;
    latitudeCheckOut: TNullable<number>;
    checkIn: TNullable<string>;
    checkOut: TNullable<string>;
    locationType: ELocationType;
    attendanceType: EAttendanceType;
    userId: TNullable<string>;
    user: AccountAssocAttendance;

    constructor(
        id: string,
        date: string,
        longitudeCheckIn: TNullable<number>,
        latitudeCheckIn: TNullable<number>,
        longitudeCheckOut: TNullable<number>,
        latitudeCheckOut: TNullable<number>,
        checkIn: TNullable<string>,
        checkOut: TNullable<string>,
        locationType: ELocationType,
        attendanceType: EAttendanceType,
        userId: TNullable<string>,
        user: AccountAssocAttendance,
        createdAt: TNullable<string>,
        updatedAt: TNullable<string>,
        deletedAt: TNullable<string>
    ) {
        super(createdAt, updatedAt, deletedAt);

        this.id = id || undefined;
        this.date = date;
        this.longitudeCheckIn = longitudeCheckIn;
        this.latitudeCheckIn = latitudeCheckIn;
        this.longitudeCheckOut = longitudeCheckOut;
        this.latitudeCheckOut = latitudeCheckOut;
        this.checkIn = checkIn;
        this.checkOut = checkOut;
        this.locationType = locationType;
        this.attendanceType = attendanceType;

        this.userId = userId;
        this.user = user
            ? new AccountAssocAttendance(
                user.id,
                user.fullName,
                user.email,
                user.phoneNo,
                user.mobilePhoneNo,
                user.fcm,
                user.status,
                user.image,
                user.imageUrl,
                user.taxImageUrl,
                user.idImageUrl,
                user.selfieImageUrl,
                user.urbanId,
                user.userOdooId,
                user.userStores,
                user.roles,
                user.createdAt,
                user.updatedAt,
                user.deletedAt
            )
            : null;

        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
    }

    public getChainRoles(delimiter: string = ', '): string {
        if (this.user.roles.length === 0) {
            return '';
        } else {
            return this.user.roles.map(role => role.role).join(delimiter);
        }
    }

    public getAttendanceType(): string {
        if (this.attendanceType === 'present') {
            return 'Hadir';
        } else if (this.attendanceType === 'absent') {
            return 'Tidak Hadir';
        } else if (this.attendanceType === 'leave') {
            return 'Cuti';
        }

        return 'Tidak diketahui';
    }

    public getLocationType(): string {
        if (this.locationType === 'inside') {
            return 'Kerja di Toko';
        } else if (this.locationType === 'outside') {
            return 'Kerja di Luar Toko';
        } else if (this.locationType === 'others') {
            return 'Lainnya';
        }

        return 'Tidak diketahui';
    }

    getStore(index: number = 0): Store {
        return this.user.userStores[index].store;
    }
}

export class AttendanceAssocUser extends Timestamp {
    id: string;
    date: string;
    longitudeCheckIn: TNullable<number>;
    latitudeCheckIn: TNullable<number>;
    longitudeCheckOut: TNullable<number>;
    latitudeCheckOut: TNullable<number>;
    checkIn: TNullable<string>;
    checkOut: TNullable<string>;

    constructor(
        id: string,
        date: string,
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
        this.date = date;
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
