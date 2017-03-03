import {Table} from "./Table";
import {TableRow} from "./TableRow";
import {selectRows, selectRowsFromCache, SelectRowsConfig} from "../API";
import * as _ from "underscore";

export interface QueryTableConfig {
    queryName:  string,
    schemaName: string,
    viewName?:  string
}

export class QueryTable extends Table {
    queryName:  string;
    schemaName: string;
    viewName:   string = '';

    constructor(config: QueryTableConfig) {
        super({});

        this.queryName  = config.queryName;
        this.schemaName = config.queryName;

        if (config.viewName) {
            this.viewName = config.viewName;
        }

        this.load();
    }

    /*
     * Load the data from either the local cache or the database.
     */
    load() {
        let data;
        let queryConfig: SelectRowsConfig = {};
        if (!_.isBlank(this.viewName)) {
            queryConfig.viewName = this.viewName;
        }

        try {
            data = selectRowsFromCache(this.schemaName, this.queryName, this.viewName);

            this._handleData({
                headers: data.colMetadata.map(    (colObject)    => { return colObject.shortCaption;                 }),
                columns: data.colDisplayData.map( (columnObject) => { return (columnObject.dataIndex).toLowerCase(); }),
                rows:    data.rows
            });
        }
        catch(e) {
            selectRows(this.schemaName, this.queryName, queryConfig).then(function(data) {
                let anyData = data as any;

                this._handleData({
                    headers: anyData.columnModel.map((columnObject) => { return columnObject.header;    }),
                    columns: anyData.columnModel.map((columnObject) => { return columnObject.dataIndex; }),
                    rows:    anyData.rows
                });
            });
        }
    }

    /*
     *  This handles the data from the load() method.
     */
    private _handleData(data: {rows: any, columns: any, headers: any}) {
        this.setRowHeaders(data.headers);

        let columns = data.columns;
        this.rows(
            data.rows.map((row) => {
                return new TableRow({
                    rowData: columns.map((columnName) => { return row[columnName]; })
                });
            })
        );
    }
}