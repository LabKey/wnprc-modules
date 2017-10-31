import { TableRow, TableColumn } from "./TableRow";

export interface TableConfig {
    rows: TableRow[] | KnockoutObservableArray<TableRow>
    rowHeaders?: string[]
}

export class Table {
    isLoading:  KnockoutObservable<boolean>       = ko.observable(false);
    rows:       KnockoutObservableArray<TableRow> = ko.observableArray() as KnockoutObservableArray<TableRow>;
    rowHeaders: KnockoutObservableArray<string | TableColumn>   = ko.observableArray(['placeholder']);

    selectedRows: KnockoutComputed<TableRow[]>;
    hasRows:      KnockoutComputed<boolean>;

    constructor(config: TableConfig) {
        if (ko.isObservable(config.rows)) {
            this.rows = config.rows;
        }
        else {
            this.rows(config.rows);
        }

        if (config.rowHeaders) {
            this.setRowHeaders(config.rowHeaders);
        }

        this.selectedRows = ko.pureComputed(() => {
            return this.rows().filter((row) => {
                return row.isSelected();
            });
        });

        this.hasRows = ko.pureComputed(() => {
            return this.rows().length > 0;
        });
    }

    setRowHeaders(newHeaders: string[]) {
        this.rowHeaders.splice(1, this.rowHeaders().length - 1);
        this.rowHeaders.push.apply(this.rowHeaders, newHeaders);
        this.rowHeaders.shift();
    }
}