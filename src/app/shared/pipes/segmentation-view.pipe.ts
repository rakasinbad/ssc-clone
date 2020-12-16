import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'segmentationView' })
export class SegmentationViewPipe implements PipeTransform {
    transform(name: string, amount: number): string {
        if (!name) {
            return null;
        }

        return amount > 1 ? `${name} (+${amount - 1} others)` : name;
    }
}
