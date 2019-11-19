import { Cluster } from './cluster.model';
import { TNullable, TStatus } from './global.model';
import { ITimestamp, Timestamp } from './timestamp.model';

interface IStoreCluster extends ITimestamp {
    id: string;
    storeId: string;
    clusterId: string;
    status: TStatus;
    cluster?: Cluster;
}

export class StoreCluster extends Timestamp implements IStoreCluster {
    private _cluster: Cluster;

    constructor(
        private _id: string,
        private _storeId: string,
        private _clusterId: string,
        private _status: TStatus,
        createdAt: string,
        updatedAt: string,
        deletedAt: TNullable<string>
    ) {
        super(createdAt, updatedAt, deletedAt);
    }

    get id(): string {
        return this._id;
    }

    get storeId(): string {
        return this._storeId;
    }

    get clusterId(): string {
        return this._clusterId;
    }

    get status(): TStatus {
        return this._status;
    }

    get cluster(): Cluster {
        return this._cluster;
    }

    set cluster(value: Cluster) {
        this._cluster = value
            ? new Cluster(
                  value.id,
                  value.name,
                  value.supplierId,
                  value.createdAt,
                  value.updatedAt,
                  value.deletedAt
              )
            : null;
    }
}
