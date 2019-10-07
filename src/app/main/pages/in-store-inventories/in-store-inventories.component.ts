import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { fuseAnimations } from '@fuse/animations';

@Component({
    selector: 'app-in-store-inventories',
    templateUrl: './in-store-inventories.component.html',
    styleUrls: ['./in-store-inventories.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None
})
export class InStoreInventoriesComponent implements OnInit {
    dataSource: Array<object>;
    displayedColumns = ['id', 'name', 'address', 'type', 'active', 'actions'];

    @ViewChild(MatPaginator, { static: true })
    paginator: MatPaginator;

    @ViewChild(MatSort, { static: true })
    sort: MatSort;

    @ViewChild('filter', { static: true })
    filter: ElementRef;

    constructor() {}

    ngOnInit(): void {
        this.dataSource = this.dummySource();
    }

    private dummySource(): Array<object> {
        return [
            {
                id: '3',
                name: 'Toko Three Jaya',
                address: 'Suite 048',
                longitude: -126.214,
                latitude: -49.7615,
                phoneNo: '0463 6014 3244',
                status: 'active',
                storeTypeId: '1',
                storeGroupId: '2',
                storeSegmentId: '2',
                urbanId: '1',
                warehouseId: '3',
                storeOdooId: '13390',
                createdAt: '2019-09-03T05:14:59.704Z',
                updatedAt: '2019-09-03T05:14:59.704Z',
                deletedAt: null,
                lastMileTypeId: null,
                userStores: [],
                storeCreditLines: [
                    {
                        id: '3',
                        storeId: '3',
                        creditLineId: '2',
                        status: 'active',
                        createdAt: '2019-09-03T05:14:59.894Z',
                        updatedAt: '2019-09-03T05:14:59.894Z',
                        deletedAt: null,
                        creditLine: {
                            id: '2',
                            redit: true,
                            creditLimit: '200000000.00',
                            status: 'active',
                            distributorId: '2',
                            createdAt: '2019-09-03T05:14:59.889Z',
                            updatedAt: '2019-09-03T05:14:59.889Z',
                            deletedAt: null
                        }
                    }
                ],
                storeType: {
                    id: '1',
                    name: 'supermarket',
                    createdAt: '2019-09-03T05:14:59.672Z',
                    updatedAt: '2019-09-03T05:14:59.672Z',
                    deletedAt: null
                },
                storeGroup: {
                    id: '2',
                    name: 'Indo Group',
                    createdAt: '2019-09-03T05:14:59.677Z',
                    updatedAt: '2019-09-03T05:14:59.677Z',
                    deletedAt: null
                },
                storeSegment: {
                    id: '2',
                    name: 'MT',
                    createdAt: '2019-09-03T05:14:59.683Z',
                    updatedAt: '2019-09-03T05:14:59.683Z',
                    deletedAt: null
                },
                storeConfig: {
                    id: '3',
                    startingWorkHour: '09:00:00',
                    finishedWorkHour: '19:00:00',
                    status: 'active',
                    storeId: '3',
                    createdAt: '2019-09-03T05:14:59.819Z',
                    updatedAt: '2019-09-03T05:14:59.819Z',
                    deletedAt: null
                },
                principalStores: [],
                storeClusters: [
                    {
                        id: '3',
                        storeId: '3',
                        clusterId: '2',
                        status: 'active',
                        createdAt: '2019-09-03T05:14:59.885Z',
                        updatedAt: '2019-09-03T05:14:59.885Z',
                        deletedAt: null,
                        cluster: {
                            id: '2',
                            name: 'Lever Clusters',
                            principalId: '1',
                            createdAt: '2019-09-03T05:14:59.879Z',
                            updatedAt: '2019-09-03T05:14:59.879Z',
                            deletedAt: null
                        }
                    }
                ],
                warehouse: {
                    id: '3',
                    name: 'Aceh',
                    address: 'Suite 805',
                    longitude: 82.9414,
                    latitude: 18.3472,
                    phoneNo: '(+62) 367 4325 1192',
                    largeArea: 400,
                    status: 'active',
                    distributorId: '1',
                    urbanId: '1',
                    createdAt: '2019-09-03T05:14:59.697Z',
                    updatedAt: '2019-09-03T05:14:59.697Z',
                    deletedAt: null
                }
            },
            {
                id: '2',
                name: 'Toko Two Jaya',
                address: 'Suite 372',
                longitude: -54.5373,
                latitude: -21.0671,
                phoneNo: '0478 9987 9923',
                status: 'active',
                storeTypeId: '1',
                storeGroupId: '1',
                storeSegmentId: '2',
                urbanId: '1',
                warehouseId: '1',
                storeOdooId: '13387',
                createdAt: '2019-09-03T05:14:59.704Z',
                updatedAt: '2019-09-03T05:14:59.704Z',
                deletedAt: null,
                lastMileTypeId: null,
                userStores: [
                    {
                        id: '3',
                        userId: '3',
                        storeId: '2',
                        status: 'active',
                        createdAt: '2019-09-03T05:14:59.719Z',
                        updatedAt: '2019-09-03T05:14:59.719Z',
                        deletedAt: null,
                        user: {
                            id: '3',
                            fullname: 'Siswo Handoko',
                            email: 'handoko@sinbad.co.id',
                            phoneNo: '089687476161',
                            status: 'active',
                            urbanId: '1',
                            userOdooId: '3',
                            createdAt: '2019-09-03T05:14:59.711Z',
                            updatedAt: '2019-09-03T05:14:59.711Z',
                            deletedAt: null
                        }
                    },
                    {
                        id: '5',
                        userId: '5',
                        storeId: '2',
                        status: 'active',
                        createdAt: '2019-09-03T05:14:59.719Z',
                        updatedAt: '2019-09-03T05:14:59.719Z',
                        deletedAt: null,
                        user: {
                            id: '5',
                            fullname: 'Bagus Agung N.',
                            email: 'bagus@sinbad.co.id',
                            phoneNo: '085627751511',
                            status: 'active',
                            urbanId: '1',
                            userOdooId: '5',
                            createdAt: '2019-09-03T05:14:59.711Z',
                            updatedAt: '2019-09-03T05:14:59.711Z',
                            deletedAt: null
                        }
                    },
                    {
                        id: '2',
                        userId: '2',
                        storeId: '2',
                        status: 'active',
                        createdAt: '2019-09-03T05:14:59.719Z',
                        updatedAt: '2019-09-03T05:14:59.719Z',
                        deletedAt: null,
                        user: {
                            id: '2',
                            fullname: 'Hari Sakti Putra',
                            email: 'sakti@sinbad.co.id',
                            phoneNo: '087645521311',
                            status: 'active',
                            urbanId: '1',
                            userOdooId: '2',
                            createdAt: '2019-09-03T05:14:59.711Z',
                            updatedAt: '2019-09-03T05:14:59.711Z',
                            deletedAt: null
                        }
                    }
                ],
                storeCreditLines: [
                    {
                        id: '2',
                        storeId: '2',
                        creditLineId: '1',
                        status: 'active',
                        createdAt: '2019-09-03T05:14:59.894Z',
                        updatedAt: '2019-09-03T05:14:59.894Z',
                        deletedAt: null,
                        creditLine: {
                            id: '1',
                            redit: true,
                            creditLimit: '100000000.00',
                            status: 'active',
                            distributorId: '1',
                            createdAt: '2019-09-03T05:14:59.889Z',
                            updatedAt: '2019-09-03T05:14:59.889Z',
                            deletedAt: null
                        }
                    }
                ],
                storeType: {
                    id: '1',
                    name: 'supermarket',
                    createdAt: '2019-09-03T05:14:59.672Z',
                    updatedAt: '2019-09-03T05:14:59.672Z',
                    deletedAt: null
                },
                storeGroup: {
                    id: '1',
                    name: 'Alfa Group',
                    createdAt: '2019-09-03T05:14:59.677Z',
                    updatedAt: '2019-09-03T05:14:59.677Z',
                    deletedAt: null
                },
                storeSegment: {
                    id: '2',
                    name: 'MT',
                    createdAt: '2019-09-03T05:14:59.683Z',
                    updatedAt: '2019-09-03T05:14:59.683Z',
                    deletedAt: null
                },
                storeConfig: {
                    id: '2',
                    startingWorkHour: '08:00:00',
                    finishedWorkHour: '18:00:00',
                    status: 'active',
                    storeId: '2',
                    createdAt: '2019-09-03T05:14:59.819Z',
                    updatedAt: '2019-09-03T05:14:59.819Z',
                    deletedAt: null
                },
                principalStores: [
                    {
                        id: '2',
                        principalId: '2',
                        storeId: '2',
                        status: 'active',
                        createdAt: '2019-09-03T05:14:59.854Z',
                        updatedAt: '2019-09-03T05:14:59.854Z',
                        deletedAt: null,
                        principal: {
                            id: '2',
                            name: 'PT. Sari Husada Bhakti',
                            address: 'Apt. 470',
                            longitude: 163.91,
                            latitude: -9.7038,
                            phoneNo: '0935 1270 410',
                            status: 'active',
                            urbanId: '1',
                            createdAt: '2019-09-03T05:14:59.840Z',
                            updatedAt: '2019-09-03T05:14:59.840Z',
                            deletedAt: null
                        }
                    },
                    {
                        id: '1',
                        principalId: '1',
                        storeId: '2',
                        status: 'active',
                        createdAt: '2019-09-03T05:14:59.854Z',
                        updatedAt: '2019-09-03T05:14:59.854Z',
                        deletedAt: null,
                        principal: {
                            id: '1',
                            name: 'PT. Unilever Indonesia Tbk',
                            address: 'Suite 107',
                            longitude: -28.7045,
                            latitude: -71.5039,
                            phoneNo: '(+62) 952 7070 879',
                            status: 'active',
                            urbanId: '1',
                            createdAt: '2019-09-03T05:14:59.840Z',
                            updatedAt: '2019-09-03T05:14:59.840Z',
                            deletedAt: null
                        }
                    }
                ],
                storeClusters: [
                    {
                        id: '2',
                        storeId: '2',
                        clusterId: '2',
                        status: 'active',
                        createdAt: '2019-09-03T05:14:59.885Z',
                        updatedAt: '2019-09-03T05:14:59.885Z',
                        deletedAt: null,
                        cluster: {
                            id: '2',
                            name: 'Lever Clusters',
                            principalId: '1',
                            createdAt: '2019-09-03T05:14:59.879Z',
                            updatedAt: '2019-09-03T05:14:59.879Z',
                            deletedAt: null
                        }
                    }
                ],
                warehouse: {
                    id: '1',
                    name: 'DC Tanggerang',
                    address: 'Suite 846',
                    longitude: 144.291,
                    latitude: 83.7541,
                    phoneNo: '0605 7304 7079',
                    largeArea: 400,
                    status: 'active',
                    distributorId: '2',
                    urbanId: '1',
                    createdAt: '2019-09-03T05:14:59.697Z',
                    updatedAt: '2019-09-03T05:14:59.697Z',
                    deletedAt: null
                }
            },
            {
                id: '1',
                name: 'Toko One Jaya',
                address: 'Apt. 333',
                longitude: 12.4325,
                latitude: 34.4118,
                phoneNo: '027 8703 773',
                status: 'active',
                storeTypeId: '1',
                storeGroupId: '1',
                storeSegmentId: '1',
                urbanId: '1',
                warehouseId: '1',
                storeOdooId: '13386',
                createdAt: '2019-09-03T05:14:59.704Z',
                updatedAt: '2019-09-03T05:14:59.704Z',
                deletedAt: null,
                lastMileTypeId: null,
                userStores: [
                    {
                        id: '4',
                        userId: '4',
                        storeId: '1',
                        status: 'active',
                        createdAt: '2019-09-03T05:14:59.719Z',
                        updatedAt: '2019-09-03T05:14:59.719Z',
                        deletedAt: null,
                        user: {
                            id: '4',
                            fullname: 'Dendi Shadewo',
                            email: 'dendi@sinbad.co.id',
                            phoneNo: '082312344411',
                            status: 'active',
                            urbanId: '1',
                            userOdooId: '4',
                            createdAt: '2019-09-03T05:14:59.711Z',
                            updatedAt: '2019-09-03T05:14:59.711Z',
                            deletedAt: null
                        }
                    },
                    {
                        id: '1',
                        userId: '1',
                        storeId: '1',
                        status: 'active',
                        createdAt: '2019-09-03T05:14:59.719Z',
                        updatedAt: '2019-09-03T05:14:59.719Z',
                        deletedAt: null,
                        user: {
                            id: '1',
                            fullname: 'Ferbryan Dion Wartono',
                            email: 'dion@sinbad.co.id',
                            phoneNo: '089657338221',
                            status: 'active',
                            urbanId: '1',
                            userOdooId: '1',
                            createdAt: '2019-09-03T05:14:59.711Z',
                            updatedAt: '2019-09-03T05:14:59.711Z',
                            deletedAt: null
                        }
                    },
                    {
                        id: '6',
                        userId: '6',
                        storeId: '1',
                        status: 'active',
                        createdAt: '2019-09-03T05:14:59.719Z',
                        updatedAt: '2019-09-03T05:14:59.719Z',
                        deletedAt: null,
                        user: {
                            id: '6',
                            fullname: 'Novreza Ridwansyah',
                            email: 'reza@sinbad.co.id',
                            phoneNo: '085331322112',
                            status: 'active',
                            urbanId: '1',
                            userOdooId: '6',
                            createdAt: '2019-09-03T05:14:59.711Z',
                            updatedAt: '2019-09-03T05:14:59.711Z',
                            deletedAt: null
                        }
                    }
                ],
                storeCreditLines: [
                    {
                        id: '1',
                        storeId: '1',
                        creditLineId: '1',
                        status: 'active',
                        createdAt: '2019-09-03T05:14:59.894Z',
                        updatedAt: '2019-09-03T05:14:59.894Z',
                        deletedAt: null,
                        creditLine: {
                            id: '1',
                            redit: true,
                            creditLimit: '100000000.00',
                            status: 'active',
                            distributorId: '1',
                            createdAt: '2019-09-03T05:14:59.889Z',
                            updatedAt: '2019-09-03T05:14:59.889Z',
                            deletedAt: null
                        }
                    }
                ],
                storeType: {
                    id: '1',
                    name: 'supermarket',
                    createdAt: '2019-09-03T05:14:59.672Z',
                    updatedAt: '2019-09-03T05:14:59.672Z',
                    deletedAt: null
                },
                storeGroup: {
                    id: '1',
                    name: 'Alfa Group',
                    createdAt: '2019-09-03T05:14:59.677Z',
                    updatedAt: '2019-09-03T05:14:59.677Z',
                    deletedAt: null
                },
                storeSegment: {
                    id: '1',
                    name: 'GT',
                    createdAt: '2019-09-03T05:14:59.683Z',
                    updatedAt: '2019-09-03T05:14:59.683Z',
                    deletedAt: null
                },
                storeConfig: {
                    id: '1',
                    startingWorkHour: '07:00:00',
                    finishedWorkHour: '16:00:00',
                    status: 'active',
                    storeId: '1',
                    createdAt: '2019-09-03T05:14:59.819Z',
                    updatedAt: '2019-09-03T05:14:59.819Z',
                    deletedAt: null
                },
                principalStores: [
                    {
                        id: '3',
                        principalId: '3',
                        storeId: '1',
                        status: 'active',
                        createdAt: '2019-09-03T05:14:59.854Z',
                        updatedAt: '2019-09-03T05:14:59.854Z',
                        deletedAt: null,
                        principal: {
                            id: '3',
                            name: 'PT. Yupi Indo Jelly Gum',
                            address: 'Apt. 226',
                            longitude: -87.3271,
                            latitude: -76.7973,
                            phoneNo: '(+62) 323 7519 8530',
                            status: 'active',
                            urbanId: '1',
                            createdAt: '2019-09-03T05:14:59.840Z',
                            updatedAt: '2019-09-03T05:14:59.840Z',
                            deletedAt: null
                        }
                    },
                    {
                        id: '5',
                        principalId: '5',
                        storeId: '1',
                        status: 'active',
                        createdAt: '2019-09-03T05:14:59.854Z',
                        updatedAt: '2019-09-03T05:14:59.854Z',
                        deletedAt: null,
                        principal: {
                            id: '5',
                            name: 'PT. Colgate Palmolive Indonesia',
                            address: 'Suite 478',
                            longitude: 0.7654,
                            latitude: 4.282,
                            phoneNo: '(+62) 963 7943 4287',
                            status: 'active',
                            urbanId: '1',
                            createdAt: '2019-09-03T05:14:59.840Z',
                            updatedAt: '2019-09-03T05:14:59.840Z',
                            deletedAt: null
                        }
                    },
                    {
                        id: '4',
                        principalId: '4',
                        storeId: '1',
                        status: 'active',
                        createdAt: '2019-09-03T05:14:59.854Z',
                        updatedAt: '2019-09-03T05:14:59.854Z',
                        deletedAt: null,
                        principal: {
                            id: '4',
                            name: 'PT. Multi Bintang Indonesia',
                            address: 'Suite 192',
                            longitude: -9.1852,
                            latitude: 44.053,
                            phoneNo: '(+62) 422 3105 936',
                            status: 'active',
                            urbanId: '1',
                            createdAt: '2019-09-03T05:14:59.840Z',
                            updatedAt: '2019-09-03T05:14:59.840Z',
                            deletedAt: null
                        }
                    }
                ],
                storeClusters: [
                    {
                        id: '1',
                        storeId: '1',
                        clusterId: '2',
                        status: 'active',
                        createdAt: '2019-09-03T05:14:59.885Z',
                        updatedAt: '2019-09-03T05:14:59.885Z',
                        deletedAt: null,
                        cluster: {
                            id: '2',
                            name: 'Lever Clusters',
                            principalId: '1',
                            createdAt: '2019-09-03T05:14:59.879Z',
                            updatedAt: '2019-09-03T05:14:59.879Z',
                            deletedAt: null
                        }
                    }
                ],
                warehouse: {
                    id: '1',
                    name: 'DC Tanggerang',
                    address: 'Suite 846',
                    longitude: 144.291,
                    latitude: 83.7541,
                    phoneNo: '0605 7304 7079',
                    largeArea: 400,
                    status: 'active',
                    distributorId: '2',
                    urbanId: '1',
                    createdAt: '2019-09-03T05:14:59.697Z',
                    updatedAt: '2019-09-03T05:14:59.697Z',
                    deletedAt: null
                }
            }
        ];
    }
}
