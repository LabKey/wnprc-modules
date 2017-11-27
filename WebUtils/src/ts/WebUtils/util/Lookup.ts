import * as _ from "underscore";
import {selectRows} from "../API";

import ko from "../externals/knockout-enhanced";

export interface LookupConfig {
    seedData?:  {[name: string]: string},
    schemaName: string,
    queryName:  string,
    columns:    string | string[],
    keyColumn:  string,
    valueAccessor: string
}

export class Lookup {
    private _lookupTable: {[name: string]: string} = {};
    schemaName:    string;
    queryName:     string;
    columns:       string[] = [];
    keyColumn:     string;
    valueAccessor: string;

    constructor(config: LookupConfig) {
        if (config.seedData) {
            this._lookupTable = config.seedData;
        }

        this.schemaName    = config.schemaName;
        this.queryName     = config.queryName;
        this.columns       = _.isArray(config.columns) ? config.columns : config.columns.split(",");
        this.keyColumn     = config.keyColumn;
        this.valueAccessor = config.valueAccessor;
    }

    lookup(valueToLookup: string | KnockoutObservable<string>): string {
        let key = ko.unwrap(valueToLookup);

        if (key in this._lookupTable) {
            return this._lookupTable[key];
        }
        else {
            let config: any = {
                columns: this.columns
            };

            config[`${this.keyColumn}~eq`] = key;

            selectRows(this.schemaName, this.queryName, config).then((raw_data:any) => {
                let data = raw_data as any;
                if (data.rows.length > 0) {
                    _.each(data.rows, (data, i: number) => {
                        let row = data as {[name: string]: string};

                        let value = _.isString(this.valueAccessor)   ? row[this.valueAccessor] :
                                    _.isFunction(this.valueAccessor) ? this.valueAccessor(row) :
                                                                       null;

                        this._lookupTable[row[this.keyColumn]] = value;
                    });
                }
                else {
                    this._lookupTable[key] = `[${key}]`;
                }

                // After we've loaded the value, telling knockout that the value has mutated will trigger it to call
                // this function again, and it will get the correct value this time.  We have to cast this to "any"
                // because this is not a public API.
                if (ko.isObservable(valueToLookup)) {
                    (<any>valueToLookup).valueHasMutated();
                }
            });

            return '[loading...]';
        }
    }
}


// Register this class as a knockout filter.
(<any>ko).filters['lookup'] = function(value: string, lookup: Lookup): string {
    if (lookup) {
        return lookup.lookup(value);
    }
    else {
        return value;
    }
};