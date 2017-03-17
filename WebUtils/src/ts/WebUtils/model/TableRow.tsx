import * as _ from "underscore";
import * as React from "react";

export interface HTMLTableColumn {
    getHTML(): string;
    getValue(): string;
}

export function isHTMLTableColumn(variable: TableColumn): variable is HTMLTableColumn {
    return _.isFunction((variable as HTMLTableColumn).getHTML);
}

export interface ReactTableColumn {
    getReactElement(): JSX.Element;
    getValue(): string;
}

export class SimpleStringColumn implements ReactTableColumn {
    constructor(public value: string) {

    }

    getReactElement(): JSX.Element {
        return <span>{this.value}</span>;
    }

    getValue(): string {
        return this.value;
    }
}

export class SimpleLinkColumn implements ReactTableColumn {
    constructor(public display: string, public address: string) {}

    getReactElement(): JSX.Element {
        return (
            <span>
                <a href={this.address}>{this.display}</a>
            </span>
        )
    }

    getValue(): string {
        return this.display;
    }
}


// Thank you: http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
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

    key: string = guid();

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