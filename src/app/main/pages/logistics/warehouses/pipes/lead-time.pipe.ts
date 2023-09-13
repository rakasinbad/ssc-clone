import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'leadTime' })
export class LeadTimePipe implements PipeTransform {
    transform(day: number): string {
        if (isNaN(day)) {
            return '-';
        }

        const newDay = +day;

        return newDay > 1 ? `${newDay} Days` : `${newDay} Day`;
    }
}
