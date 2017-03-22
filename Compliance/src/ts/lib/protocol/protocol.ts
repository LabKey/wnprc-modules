import moment = require("moment");
import Moment = moment.Moment;
import {FlagSet} from "../checkboxset";


export interface Protocol {
    title: string;
    number: string;
    principal_investigator: string,
    spi_primary: string,
    spi_secondary: string,
    original_approval_date: Moment
    approval_date: Moment,

    flags: ProtocolFlags;
    species: SpeciesProtocolInfo[]
}


export type ProtocolFlagName = "has_biological_hazards" | "has_chemical_hazards" | "has_physical_hazards"
    | "has_radiation_hazards"  | "has_wildlife_hazards" | "has_other_hazards"
    | "involves_eurthanasia"   | "allows_single_housing";

export class ProtocolFlags extends FlagSet<ProtocolFlagName> {
    constructor() {
        super();

        this._initFlag("has_biological_hazards", "Biological Hazards");
        this._initFlag("has_chemical_hazards",   "Chemical Hazards");
        this._initFlag("has_physical_hazards",   "Physical Hazards");
        this._initFlag("has_radiation_hazards",  "Radiation Hazards");
        this._initFlag("has_wildlife_hazards",   "Wildlife Hazards");
        this._initFlag("has_other_hazards",      "Other Hazards");
    }
}

export type SpeciesFlagNames = "has_drugs";

export class SpeciesFlags extends FlagSet<SpeciesFlagNames> {
    constructor() {
        super();

        this._initFlag("has_drugs");
    }
}

export class SpeciesProtocolInfo {
    max_number_of_animals: number = 0;
    flags: SpeciesFlags = new SpeciesFlags();

    constructor(public readonly species_classifier: string) {

    }
}