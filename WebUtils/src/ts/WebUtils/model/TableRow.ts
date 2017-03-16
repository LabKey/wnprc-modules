import * as _ from "underscore";

export interface HTMLTableColumn {
    getHTML(): string;
    getValue(): string;
}

export function isHTMLTableColumn(variable: TableColumn): variable is HTMLTableColumn {
    return _.isFunction((<HTMLTableColumn>variable).getHTML);
}

export interface ReactTableColumn {
    getReactElement(): JSX.Element;
    getValue(): string;
}

export class SimpleStringColumn implements HTMLTableColumn {
    constructor(public value: string) {

    }

    getHTML(): string {
        return this.value;
    }

    getValue(): string {
        return this.value;
    }
}

export type TableColumn = HTMLTableColumn | ReactTableColumn

export interface TableRowConfig {
    columns: TableColumn[],
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

    columns: TableColumn[];
    otherData: any = {};

    constructor(config: TableRowConfig) {
        this.warn = ko.computed(() => {
            return (ko.isObservable(config.warn)) ? config.warn() : false;
        });

        this.err = ko.computed(() => {
            return (ko.isObservable(config.err)) ? config.err() : false;
        });

        this.columns = config.columns;

        if (config.otherData) {
            this.otherData = config.otherData;
        }
    }
}