import {TableRow} from "./TableRow";

export interface TableConfig {
    rows: string[] | TableRow[] | KnockoutObservableArray<TableRow>
    rowHeaders?: string[]
}

export class Table {
    isLoading:  KnockoutObservable<boolean>       = ko.observable(false);
    rows:       KnockoutObservableArray<TableRow> = ko.observableArray() as KnockoutObservableArray<TableRow>;
    rowHeaders: KnockoutObservableArray<string>   = ko.observableArray(['placeholder']);

    selectedRows: KnockoutComputed<TableRow[]>;
    hasRows:      KnockoutComputed<boolean>;

    constructor(config) {
        if (ko.isObservable(config.rows)) {
            this.rows = config.rows;
        }
        else {
            this.rows(config.rows.map((row) => {
                return (row instanceof TableRow) ? row : new TableRow(row);
            }));
        }

        if (config.rowHeaders) {
            this.setRowHeaders(config.rowHeaders);
        }

        this.selectedRows = ko.computed(() => {
            return this.rows().filter((row) => {
                return row.isSelected();
            });
        });

        this.hasRows = ko.computed(() => {
            return this.rows().length > 0;
        });
    }

    setRowHeaders(newHeaders: string[]) {
        this.rowHeaders.splice(1, this.rowHeaders().length - 1);
        this.rowHeaders.push.apply(newHeaders);
        this.rowHeaders.shift();
    }
}