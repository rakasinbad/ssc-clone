import { EStatus } from 'app/shared/models/global.model';

interface SegmentDetailProps {
    readonly id: NonNullable<string>;
    name: string;
}

interface SegmentProps {
    amount: number;
    firstName: string;
}

interface CatalogueSegmentationProps {
    readonly id: NonNullable<string>;
    externalId: string;
    name: string;
    status: EStatus;
    supplierId: string;
    channel?: SegmentProps;
    channels?: SegmentDetailProps[];
    cluster?: SegmentProps;
    clusters?: SegmentDetailProps[];
    group?: SegmentProps;
    groups?: SegmentDetailProps[];
    totalChannel?: () => number;
    totalCluster?: () => number;
    totalGroup?: () => number;
    totalType?: () => number;
    totalWarehouse?: () => number;
    type?: SegmentProps;
    types?: SegmentDetailProps[];
    warehouse?: SegmentProps;
    warehouses?: SegmentDetailProps[];
}

export class CatalogueSegmentation implements CatalogueSegmentationProps {
    readonly id: NonNullable<string>;
    externalId: string;
    name: string;
    status: EStatus;
    supplierId: string;
    channel?: SegmentProps;
    channels?: SegmentDetailProps[];
    cluster?: SegmentProps;
    clusters?: SegmentDetailProps[];
    group?: SegmentProps;
    groups?: SegmentDetailProps[];
    type?: SegmentProps;
    types?: SegmentDetailProps[];
    warehouse?: SegmentProps;
    warehouses?: SegmentDetailProps[];

    constructor(data: CatalogueSegmentationProps) {
        const {
            id,
            externalId,
            name,
            status,
            supplierId,
            channel,
            channels,
            cluster,
            clusters,
            group,
            groups,
            type,
            types,
            warehouse,
            warehouses,
        } = data;

        this.id = id;
        this.externalId = (externalId && externalId.trim()) || null;
        this.name = (name && name.trim()) || null;
        this.status = status;
        this.supplierId = (supplierId && supplierId.trim()) || null;

        if (typeof channel !== 'undefined') {
            this.channel = channel || null;
        }

        if (typeof channels !== 'undefined') {
            this.channels = channels || null;
        }

        if (typeof cluster !== 'undefined') {
            this.cluster = cluster || null;
        }

        if (typeof clusters !== 'undefined') {
            this.clusters = clusters || null;
        }

        if (typeof group !== 'undefined') {
            this.group = group || null;
        }

        if (typeof groups !== 'undefined') {
            this.groups = groups || null;
        }

        if (typeof type !== 'undefined') {
            this.type = type || null;
        }

        if (typeof types !== 'undefined') {
            this.types = types || null;
        }

        if (typeof warehouse !== 'undefined') {
            this.warehouse = warehouse || null;
        }

        if (typeof warehouses !== 'undefined') {
            this.warehouses = warehouses || null;
        }
    }

    totalChannel(): number {
        return (this.channels && this.channels.length) || 0;
    }

    totalCluster(): number {
        return (this.clusters && this.clusters.length) || 0;
    }

    totalGroup(): number {
        return (this.groups && this.groups.length) || 0;
    }

    totalType(): number {
        return (this.types && this.types.length) || 0;
    }

    totalWarehouse(): number {
        return (this.warehouses && this.warehouses.length) || 0;
    }
}
