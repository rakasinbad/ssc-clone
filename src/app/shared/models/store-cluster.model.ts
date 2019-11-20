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
    public cluster: Cluster;

    constructor(
        public id: string,
        public storeId: string,
        public clusterId: string,
        public status: TStatus,
        createdAt: string,
        updatedAt: string,
        deletedAt: TNullable<string>
    ) {
        super(createdAt, updatedAt, deletedAt);
    }

    set setCluster(value: Cluster) {
        this.cluster = value
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
