import moment = require("moment");
import Moment = moment.Moment;
import * as _ from "underscore";


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

export interface FlagInfo {
    checked:      boolean,
    displayName?: string,
    description?: string
}

export type ProtocolFlagName = "has_biological_hazards" | "has_chemical_hazards" | "has_physical_hazards"
    | "has_radiation_hazards"  | "has_wildlife_hazards" | "has_other_hazards"
    | "involves_eurthanasia"   | "allows_single_housing";

export class ProtocolFlags {
    private _flags: {[name: string]: FlagInfo} = {};

    constructor() {
        this._initFlag("has_biological_hazards", "Biological Hazards");
        this._initFlag("has_chemical_hazards",   "Chemical Hazards");
        this._initFlag("has_physical_hazards",   "Physical Hazards");
        this._initFlag("has_radiation_hazards",  "Radiation Hazards");
        this._initFlag("has_wildlife_hazards",   "Wildlife Hazards");
        this._initFlag("has_other_hazards",      "Other Hazards");
    }

    private _initFlag(name: ProtocolFlagName, displayName?: string, description?: string) {
        let info: FlagInfo = {
            checked: false
        };

        if (displayName) {
            info.displayName = displayName;
        }

        if (description) {
            info.description = description;
        }

        this._flags[name] = info;
    }

    getFlagNames(): ProtocolFlagName[] {
        return _.keys(this._flags) as ProtocolFlagName[];
    }

    getFlag(name: ProtocolFlagName): boolean {
        return this.getFlagInfo(name).checked;
    }

    getFlagInfo(name: ProtocolFlagName): FlagInfo {
        return (name in this._flags) ? this._flags[name]: {checked: false};
    }

    setFlag(name: ProtocolFlagName, val: boolean): void {
        if (name in this._flags) {
            this._flags[name] = {checked: val};
        }
        else {
            this._flags[name].checked = val;
        }
    }
}


export class SpeciesProtocolInfo {
    constructor(public readonly species_classifier: string) {

    }
}