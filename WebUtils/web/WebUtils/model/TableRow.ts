import * as _ from "underscore";

export interface TableRowConfig {
    rowData: any[],
    otherData?: any,
    warn?: KnockoutObservable<boolean>,
    err?:  KnockoutObservable<boolean>
}

export class TableRow {
    isSelected: KnockoutObservable<boolean> = ko.observable(false);
    isEven:     KnockoutObservable<boolean> = ko.observable(false);
    isHidden:   KnockoutObservable<boolean> = ko.observable(false);

    warn: KnockoutComputed<boolean>;
    err:  KnockoutComputed<boolean>;

    rowData: any[];
    otherData: any = {};

    constructor(config: TableRowConfig) {
        this.warn = ko.computed(() => {
            return (ko.isObservable(config.warn)) ? config.warn() : false;
        });

        this.err = ko.computed(() => {
            return (ko.isObservable(config.err)) ? config.err() : false;
        });

        this.rowData = config.rowData;

        if (config.otherData) {
            this.otherData = config.otherData;
        }
    }

    getValueForColumnIndex(index: number): string {
        if (this.rowData && this.rowData[index]) {
            let data = this.rowData[index];
            if (_.isString(data)) {
                return data;
            }
            else if (_.isObject(data)) {
                return data['value'].toString();
            }

            throw new Error("Unrecognized column type");
        }
        else {
            return "";
        }
    }
}