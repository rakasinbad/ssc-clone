import { Pipe, PipeTransform } from '@angular/core';
import { ConditionDto } from '../models';

@Pipe({
    name: 'canAddTier',
})
export class CanAddTierPipe implements PipeTransform {
    transform(value: ConditionDto[], ...args: any[]): boolean {
        const conditions = value;
        const pageType = args[0];
        const conditionsCtrl = args[1];

        if (pageType === 'edit') {
            return false;
        }

        const nextIdx = conditions.length;
        const currIdx = conditions.length - 1;

        // Check total conditions item greater than 0
        if (conditions && conditions.length > 0) {
            // Get conditions has checked multiplication
            const hasMultiplication = conditions.filter(
                (condition) => condition.multiplication === true
            );

            // Check has multiplication so can't Add Tier
            if (hasMultiplication.length > 0) {
                return false;
            }

            // Get current conditions
            const currConditions = conditionsCtrl[currIdx];

            // Check current conditions is valid so can Add Tier
            if (currConditions.valid) {
                return true;
            }

            return false;
        }

        return false;
    }
}
