import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'orderLog' })
export class OrderLogPipe implements PipeTransform {
    transform(log: any): string {
        const updatedByStatuses = ['shipping', 'delivered', 'done'];

        if (updatedByStatuses.includes(log.status)) {
            return log.updatedBy ? `${log.description} [updated by ${log.updatedBy}]` : log.description;
        }

        if (log.status === 'cancel') {
            return log.updatedBy ? `${log.description} [updated by ${log.updatedBy}] [reason: ${log.reason || '-'}]` : `${log.description} [reason: ${log.reason || '-'}]`;
        }

        return log.updatedBy ? `${log.description} by ${log.updatedBy}` : log.description;
    }
}
