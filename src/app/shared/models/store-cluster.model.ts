import { Cluster } from './cluster.model';
import { TNullable, TStatus } from './global.model';
import { ITimestamp } from './timestamp.model';

interface IStoreCluster extends ITimestamp {
    readonly id: NonNullable<string>;
    storeId: string;
    clusterId: string;
    status: TStatus;
    cluster?: Cluster;
}

export class StoreCluster implements IStoreCluster {
    readonly id: NonNullable<string>;
    storeId: string;
    clusterId: string;
    status: TStatus;
    cluster?: Cluster;
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;

    constructor(data: StoreCluster) {
        const { id, storeId, clusterId, status, cluster, createdAt, updatedAt, deletedAt } = data;

        this.id = id;
        this.storeId = storeId;
        this.clusterId = clusterId;
        this.status = status;
        this.setCluster = cluster;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
    }

    set setCluster(value: Cluster) {
        this.cluster = value ? new Cluster(value) : null;
    }
}
