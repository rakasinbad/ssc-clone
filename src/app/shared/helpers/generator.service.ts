import { Injectable } from '@angular/core';
import * as faker from 'faker/locale/id_ID';
import { date } from '@rxweb/reactive-form-validators';

@Injectable({
    providedIn: 'root'
})
export class GeneratorService {
    generator(schema, min: number = 1, max: number): any {
        max = max || min;

        return Array.from({
            length: faker.random.number({ min, max })
        }).map(() => {
            return Object.keys(schema).reduce((entity, key) => {
                switch (schema[key]) {
                    case 'aging.day':
                        entity[key] = faker.random.arrayElement(['-', '0', '1', '2', '3']);
                        break;
                    case 'catalogue.block.reason':
                        entity[key] = faker.random.arrayElement([
                            null,
                            'Produk dimasukkan ke dalam kategori yang salah.'
                        ]);

                        break;
                    
                    case 'catalogue.block.suggest':
                        entity[key] = faker.random.arrayElement([
                            null,
                            'Produk Anda diblokir karena diunggah pada kategori yang salah.'
                        ]);
                        break;

                    case 'catalogue.block.type':
                        entity[key] = faker.random.arrayElement([
                            null,
                            'Spam'
                        ]);
                        break;

                    case 'catalogue.isArchived':
                        entity[key] = faker.random.boolean();
                        break;

                    case 'customer.hierarchy':
                        entity[key] = `TRUSTED LV${faker.random.number({ min: 0, max: 3 })}`;
                        break;

                    case 'employee.accessRight':
                        entity[key] = faker.random.arrayElement([
                            'Sales & Marketing',
                            'Finance',
                            'Operation'
                        ]);
                        break;

                    case 'employee.role':
                        entity[key] = faker.random.arrayElement([
                            'Owner',
                            'Beauty Advisor',
                            'Stock Taker'
                        ]);
                        break;

                    case 'finance.orderRef':
                        entity[key] = faker.random.arrayElement([
                            'SNB 1',
                            'SNB 2',
                            'SNB 3',
                            'SNB 4',
                            'SNB 5',
                            'SNB 6'
                        ]);
                        break;

                    case 'finance.limit.group':
                        entity[key] = faker.random.arrayElement(['CL1', 'CL2', 'CL3', '-']);
                        break;

                    case 'finance.payment.method':
                        entity[key] = faker.random.arrayElement(['Bank Transfer', 'COD']);
                        break;

                    case 'finance.segment':
                        entity[key] = faker.random.arrayElement(['GT', 'MTI']);
                        break;

                    case 'finance.source':
                        entity[key] = faker.random.arrayElement(['Sinbad', 'Non Sinbad']);
                        break;

                    case 'finance.status':
                        entity[key] = faker.random.arrayElement([
                            'Temp Paid',
                            'Waiting for Payment',
                            'Paid'
                        ]);
                        break;

                    case 'finance.top':
                        entity[key] = faker.random.number({ min: 1, max: 30 });
                        break;

                    case 'payment.method':
                        entity[key] = 'TOP/30';
                        break;

                    case 'product.name':
                        entity[key] = faker.random.arrayElement([
                            'Tabungan Panin',
                            'Panin Super Prize',
                            'Tabungan Junior',
                            'Deposito Panin',
                            'Kredit Express'
                        ]);
                        break;

                    case 'product.category':
                        entity[key] = faker.random.arrayElement([
                            'Savings',
                            'Deposito',
                            'Personal Loan'
                        ]);
                        break;

                    case 'order.id':
                        // entity[key] = 'SN01/001234';
                        // const idFirst = faker.random.number({ min: 1, max: 10 });
                        // const idSecond = faker.random.number({ min: 1, max: 500 });
                        // entity[key] = `SN${idFirst < 10 ? '0' + idFirst : idFirst}/${
                        //     idSecond < 100 ? '0' + idSecond : idSecond
                        // }`.toString();
                        entity[key] = faker.random.number({ min: 1, max: 500 });
                        break;

                    case 'order.origins':
                        const idFirst = faker.random.number({ min: 1, max: 10 });
                        const idSecond = faker.random.number({ min: 1, max: 500 });
                        entity[key] = `SN${idFirst < 10 ? '0' + idFirst : idFirst}/${
                            idSecond < 100 ? '0' + idSecond : idSecond
                        }`;
                        break;

                    case 'order.status':
                        entity[key] = faker.random.arrayElement([
                            'Dikemas',
                            'Dikirim',
                            'Diterima',
                            'Order Baru',
                            'Selesai',
                            'Siap Dikirim'
                        ]);
                        break;

                    case 'payment.type':
                        entity[key] = faker.random.arrayElement(['Pay Later', 'Pay Now']);
                        break;
                    case 'random.sku':
                        entity[key] = faker.random.number({ min: 1000000, max: 9999999 });
                        break;

                    case 'store.segment':
                        entity[key] = faker.random.arrayElement(['GT', 'MT']);
                        break;

                    case 'store.status':
                        entity[key] = faker.random.arrayElement(['Active', 'Not Active']);
                        break;

                    case 'store.type':
                        entity[key] = faker.random.arrayElement([
                            'Mom & Baby Store',
                            'Petshop',
                            'Rumah Kecantikan'
                        ]);
                        break;

                    default:
                        entity[key] = faker.fake(schema[key]);
                        break;
                }

                return entity;
            }, {});
        });
    }

    initGenerator(schema, min: number = 1, max: number): any {
        max = max || min;

        return Array.from({
            length: faker.random.number({ min, max })
        }).map(() => {
            return Object.keys(schema).reduce((entity, key) => {
                switch (schema[key]) {
                    default:
                        entity[key] = schema[key];
                        break;
                }

                return entity;
            }, {});
        });
    }

    static get accountsStoreSchema(): any {
        return {
            id: '{{random.number}}',
            storeName: '{{company.companyName}}',
            address: '{{address.streetAddress}}',
            ownerPhoneNumber: '{{phone.phoneNumber}}',
            storeSegment: 'store.segment',
            storeType: 'store.type',
            customerHierarchy: 'customer.hierarchy',
            status: 'store.status'
        };
    }

    static get accountsStoreEmployeeSchema(): any {
        return {
            id: '{{random.number}}',
            name: '{{name.firstName}}',
            role: 'employee.role',
            phoneNumber: '{{phone.phoneNumber}}',
            lastCheckIn: '{{date.recent}}'
        };
    }

    static get accountsInternalSchema(): any {
        return {
            id: '{{random.number}}',
            user: '{{name.firstName}}',
            email: '{{internet.email}}',
            role: 'employee.accessRight',
            phoneNumber: '{{phone.phoneNumber}}'
        };
    }

    static get financePaymentStatusSchema(): any {
        return {
            id: '{{random.number}}',
            orderRef: 'finance.orderRef',
            store: '{{company.companyName}}',
            receivable: '{{finance.amount}}',
            status: 'finance.status',
            source: 'finance.source',
            paymentType: 'payment.type',
            paymentMethod: 'finance.payment.method',
            orderDate: '{{date.recent}}',
            dueDate: '{{date.recent}}',
            paidOn: '{{date.recent}}',
            agingDay: 'aging.day',
            d: 'aging.day',
            proofOfPaymentStatus: '{{random.boolean}}'
        };
    }
    
    static get cataloguesSchema(): any {
        return {
            id: '{{random.number}}',
            sku: 'random.sku',
            parentSku: 'random.sku',
            name: '{{commerce.productName}}',
            image: '{{image.food}}',
            variant: '-',
            price: '{{commerce.price}}',
            stock: '{{random.number}}',
            sale: '{{random.number}}',
            isArchived: 'catalogue.isArchived',
            lastUpdate: '{{date.recent}}',
            timeLimit: '-',
            blockType: 'catalogue.block.type',
            blockReason: 'catalogue.block.reason',
            blockSuggest: 'catalogue.block.suggest'
        };
    }

    static get financeStoresSchema(): any {
        return {
            id: '{{random.number}}',
            name: '{{company.companyName}}',
            limit: '{{finance.amount}}',
            balance: '{{finance.amount}}',
            receivable: '{{finance.amount}}',
            limitGroup: 'finance.limit.group',
            segment: 'finance.segment',
            top: 'finance.top',
            lastUpdate: '{{date.recent}}'
        };
    }

    static get orderSchema(): any {
        return {
            origins: 'order.origins',
            id: 'order.id',
            orderDate: '{{date.recent}}',
            storeName: '{{company.companyName}}',
            trxAmount: '{{commerce.price}}',
            paymentMethod: 'payment.method',
            totalProduct: '{{random.number}}',
            status: 'order.status',
            deliveredOn: '{{date.recent}}',
            actualAmountDelivered: '{{commerce.price}}'
        };
    }

    static get productSchema(): any {
        return {
            id: '{{random.number}}',
            name: 'product.name',
            category: 'product.category',
            interest: '{{commerce.price}}',
            fee: '{{commerce.price}}'
        };
    }

    static get productCategoriesSchema(): any {
        return {
            id: '{{random.number}}',
            name: 'product.category'
        };
    }

    static get roleSchema(): any {
        return {
            id: '{{random.number}}',
            name: '{{name.jobType}}',
            label: '{{name.jobType}}'
        };
    }
    static get menuSchema(): any {
        return {
            id: '{{random.number}}',
            icon: '{{system.fileName}}',
            order: '{{commerce.product}}',
            name: '{{finance.accountName}}',
            link: '{{internet.url}}'
        };
    }

    static get userSchema(): any {
        return {
            id: '{{random.number}}',
            name: '{{name.firstName}} {{name.lastName}}',
            email: '{{internet.email}}',
            nip: '{{finance.account}}',
            role: '{{name.jobType}}'
        };
    }
}
