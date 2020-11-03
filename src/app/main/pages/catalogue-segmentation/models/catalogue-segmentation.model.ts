import { EStatus } from 'app/shared/models/global.model';

interface SegmentProps {
    amount: number;
    firstName: string;
}

interface CatalogueSegmentationProps {
    readonly id: NonNullable<string>;
    channel: SegmentProps;
    cluster: SegmentProps;
    externalId: string;
    group: SegmentProps;
    name: string;
    status: EStatus;
    supplierId: string;
    type: SegmentProps;
    warehouse: SegmentProps;
}

export class CatalogueSegmentation implements CatalogueSegmentationProps {
    readonly id: NonNullable<string>;
    channel: SegmentProps;
    cluster: SegmentProps;
    externalId: string;
    group: SegmentProps;
    name: string;
    status: EStatus;
    supplierId: string;
    type: SegmentProps;
    warehouse: SegmentProps;

    constructor(data: CatalogueSegmentationProps) {
        const {
            id,
            channel,
            cluster,
            externalId,
            group,
            name,
            status,
            supplierId,
            type,
            warehouse,
        } = data;

        this.id = id;
        this.channel = channel || null;
        this.cluster = cluster || null;
        this.externalId = (externalId && externalId.trim()) || null;
        this.group = group || null;
        this.name = (name && name.trim()) || null;
        this.status = status;
        this.supplierId = (supplierId && supplierId.trim()) || null;
        this.type = type || null;
        this.warehouse = warehouse || null;
    }
}
