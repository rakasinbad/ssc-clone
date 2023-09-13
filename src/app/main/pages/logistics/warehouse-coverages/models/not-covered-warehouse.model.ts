export interface NotCoveredWarehouse {
    id: string;
    city: string;
    urban: string;
    district: string;
    province: string;
    warehouseId: null;
}

export class NotCoveredWarehouse implements NotCoveredWarehouse {
    id: string;
    city: string;
    urban: string;
    district: string;
    province: string;
    warehouseId: null;

    constructor(data: NotCoveredWarehouse) {
        const {
            id,
            city,
            urban,
            district,
            province,
            warehouseId,
        } = data;

        this.id = id;
        this.city = city;
        this.urban = urban;
        this.district = district;
        this.province = province;
        this.warehouseId = warehouseId;
    }
}
