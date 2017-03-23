import {newUUID} from "WebUtils/Util";


export class Drug {
    id: string;
    snomed_code: string;
    dose_amount: number;
    dose_units: string;
    frequency_description: string;
    substance_type: string;

    constructor() {
        this.id = newUUID();
    }
}