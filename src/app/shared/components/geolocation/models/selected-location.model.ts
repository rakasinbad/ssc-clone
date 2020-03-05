import { Province } from 'app/shared/models/location.model';
import { Urban } from './urban.model';

export interface SelectedLocation {
    province: Province;
    city: string;
    district: string;
    urban: Urban;
}
