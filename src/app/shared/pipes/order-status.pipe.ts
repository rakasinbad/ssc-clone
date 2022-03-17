// import { TitleCasePipe } from '@angular/common';
// import { Pipe, PipeTransform } from '@angular/core';
// import { OrderStatus } from '../models/order-status.model';

// @Pipe({ name: 'orderStatus' })
// export class OrderStatusPipe implements PipeTransform {
//     constructor(private titleCase: TitleCasePipe) {}

//     transform(value: OrderStatus, ...args: unknown[]): string {
//         if (!value) {
//             return '-';
//         } else {
//             switch (value) {
//                 case 'checkout':
//                     return 'Quotation';

//                 case 'confirm':
//                     return 'New Order';

//                 case 'pending':
//                     return 'Awaiting to be verified';

//                 case 'pending_payment':
//                     return 'Pending Payment';

//                 case 'pending_supplier':
//                     return 'Pending Supplier';

//                 case 'pending_partial':
//                     return 'Pending Partial';

//                 case 'packing':
//                     return 'Packed';

//                 case 'shipping':
//                     return 'Shipped';

//                 case 'done':
//                     return 'Done';

//                 case 'cancel':
//                     return 'Canceled';

//                 default:
//                     return this.titleCase.transform(value);
//             }
//         }
//     }
// }
export {}
