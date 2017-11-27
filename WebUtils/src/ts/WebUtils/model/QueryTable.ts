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
        super({
            rows: []
        });

        this.queryName  = config.queryName;
        this.schemaName = config.schemaName;

        if (config.viewName) {
            this.viewName = config.viewName;
        }

        this.load();
    }

    /*
     * Load the data from either the local cache or the database.
     */
    load() {
        let data: any;
        let queryConfig: SelectRowsConfig = {};
        if (!_.isBlank(this.viewName)) {
            queryConfig.viewName = this.viewName;
        }

        try {
            data = selectRowsFromCache(this.schemaName, this.queryName, this.viewName);

            this._handleData({
                headers: data.colMetadata.map(    (colObject: any)    => { return colObject.shortCaption;                 }),
                columns: data.colDisplayData.map( (columnObject: any) => { return (columnObject.dataIndex).toLowerCase(); }),
                rows:    data.rows
            });
        }
        catch(e) {
            selectRows(this.schemaName, this.queryName, queryConfig).then((data) => {
                this._handleData({
                    headers: data.columnModel.map((columnObject: any) => { return columnObject.header;    }),
                    columns: data.columnModel.map((columnObject: any) => { return columnObject.dataIndex; }),
                    rows:    data.rows
                });
            }).catch((label) => {
                console.error("Error loading table: "+label);
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
            data.rows.map((row: any) => {
                return new TableRow({
                    columns: columns.map((columnName: string) => { return row[columnName]; })
                });
            })
        );
    }
}