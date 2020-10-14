import { BenefitFormDto } from './payload-benefit.model';
import { GeneralInfoFormDto } from './payload-general-info.model';
import { GroupFormDto } from './payload-group.model';
import { SegmentSettingFormDto } from './payload-segment-setting.model';

export interface CreateFormDto extends GeneralInfoFormDto, GroupFormDto, SegmentSettingFormDto {
    base: 'sku';
    conditions: BenefitFormDto[];
    status: 'active';
    supplierId: string;
    type: 'cross_selling';
}
