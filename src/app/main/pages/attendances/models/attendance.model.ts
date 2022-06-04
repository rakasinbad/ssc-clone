import { Store } from 'app/main/pages/accounts/merchants/models';
import { IResponsePaginate, TNullable } from 'app/shared/models/global.model';
import { Role } from 'app/shared/models/role.model';
import { ITimestamp, Timestamp } from 'app/shared/models/timestamp.model';
import { User } from 'app/shared/models/user.model';

// import { AccountAssocAttendance } from '../../accounts/models/account.model';
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
    user?: User;
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
    user: User;

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
        user: User,
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
        this.user = user ? new User(user) : null;

        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
    }

    static getChainRoles(roles: Array<Role>): string {
        return !Array.isArray(roles) ? '' : roles.map(role => role.role).join(', ');
    }

    // static getAttendanceType(attendanceType: EAttendanceType): string {
    //     if (attendanceType === 'present') {
    //         return 'Hadir';
    //     } else if (attendanceType === 'absent') {
    //         return 'Tidak Hadir';
    //     } else if (attendanceType === 'leave') {
    //         return 'Cuti';
    //     }

    //     return 'Tidak diketahui';
    // }

    // static getLocationType(locationType: ELocationType): string {
    //     if (locationType === 'inside') {
    //         return 'Kerja di Toko';
    //     } else if (locationType === 'outside') {
    //         return 'Kerja di Luar Toko';
    // } else if (locationType === 'others') {
    //         return 'Lainnya';
    //     }

    //     return 'Tidak diketahui';
    // }

    static patch(attendance: Partial<Attendance>): Partial<Attendance> {
        return attendance;
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
