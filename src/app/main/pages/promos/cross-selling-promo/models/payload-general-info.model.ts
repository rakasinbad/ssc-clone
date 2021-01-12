import { PlatformSinbad } from 'app/shared/models/platform.model';
import { PromoAllocation } from 'app/shared/models/promo-allocation.model';

export interface GeneralInfoFormDto {
    endDate: string;
    externalId: string;
    firstBuy: boolean;
    multiplication: boolean;
    image: string;
    maxRedemptionPerStore: number;
    name: string;
    platform: PlatformSinbad;
    promoAllocationType: PromoAllocation;
    // Promo Allocation Type = Budget/Rp
    promoBudget: number;
    // Promo Allocation Type = Slot/Transaction
    promoSlot: number;
    shortDescription: string;
    startDate: string;
    skpId: number;
}
