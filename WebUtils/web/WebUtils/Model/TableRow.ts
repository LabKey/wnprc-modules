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
}