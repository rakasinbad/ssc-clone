import { Pipe, PipeTransform } from '@angular/core';
import { LogicRelation } from '../models';

@Pipe({ name: 'filterLogicRelation' })
export class FilterLogicRelationPipe implements PipeTransform {
    transform(
        sources: { id: LogicRelation; label: string }[],
        onlyNa: boolean
    ): { id: LogicRelation; label: string }[] {
        if (!sources || !sources.length) {
            return null;
        }

        return onlyNa === true
            ? sources.filter((source) => source.id === LogicRelation.NA)
            : sources.filter((logic) => logic.id !== LogicRelation.NA);
    }
}
