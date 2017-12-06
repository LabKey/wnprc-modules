declare const LABKEY: any;

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDataGrid from 'react-data-grid';
import * as ReactDataGridPlugins from 'react-data-grid-addons';
import { ReactDataGridFilterSpec, ReactDataGridQuerySpec } from './react-data-grid/ReactDataGridHelperTypes';

import { LoadingOverlay } from './LoadingOverlay';
import { MasterDetailDataGrid } from './react-data-grid/MasterDetailDataGrid';

/** Main component for the LabKey breeding module. */
export class Breeding extends React.Component<any, BreedingState> {

    /** List of columns to show in the data grid */
    private gridColumns: ReactDataGrid.Column[];

    /** Define the filter renderers available for the grid */
    private gridFilters: ReactDataGridFilterSpec = {
        '*': ReactDataGridPlugins.Filters.AutoCompleteFilter,
    };

    /** Query configuration data. Lists the schema, query name (name), and (optionally) the view */
    private query: ReactDataGridQuerySpec = {
        name:   'ActiveAssignments',
        schema: 'study',
    };

    constructor(props: any, context: any) {
        super(props, context);

        this.changeFilters          = this.changeFilters.bind(this);
        this.clearFilters           = this.clearFilters.bind(this);
        this.failureCallback        = this.failureCallback.bind(this);
        this.getRow                 = this.getRow.bind(this);
        this.getRowCount            = this.getRowCount.bind(this);
        this.getValidFilterValues   = this.getValidFilterValues.bind(this);
        this.loadColumns            = this.loadColumns.bind(this);
        this.sort                   = this.sort.bind(this);
        this.successCallback        = this.successCallback.bind(this);

        this.gridColumns = [];
        this.state   = {
            filters:        {},
            isLoading:      true,
            rows:           [],
            sortColumn:     null,
            sortDirection:  null,
        };
    }

    public componentWillMount() {
        LABKEY.Query.getQueryDetails({
            failure:    this.failureCallback,
            queryName:  this.query.name,
            schemaName: this.query.schema,
            success:    (info: any) => {
                this.gridColumns = this.loadColumns(info.defaultView.columns);
                LABKEY.Query.selectRows({
                    failure:            this.failureCallback,
                    queryName:          this.query.name,
                    requiredVersion:    13.2,
                    schemaName:         this.query.schema,
                    success:            this.successCallback,
                    timeout:            5000,
                    viewName:           info.defaultView.name,
                });
            },
        });
    }

    public render() {
        return (
            <div>
                <MasterDetailDataGrid
                    columns={this.gridColumns}
                    detailRenderer={<MasterDetailExpandView/>}
                    getValidFilterValues={this.getValidFilterValues}
                    minHeight={500}
                    onAddFilter={this.changeFilters}
                    onClearFilters={this.clearFilters}
                    onGridSort={this.sort}
                    rowsCount={this.getRowCount()}
                    rowGetter={this.getRow}
                    toolbar={<ReactDataGridPlugins.Toolbar enableFilter={true}/>}
                />
                {this.state.isLoading ? <LoadingOverlay/> : null}
            </div>);
    }

    /**
     * Updates the current grid filters
     * @param filter
     */
    private changeFilters(filter: any) {
        const newFilters = _.assign({}, this.state.filters);
        if (filter.filterTerm) {
            newFilters[filter.column.key] = filter;
        } else {
            delete newFilters[filter.column.key];
        }
        this.setState({ filters: newFilters });
    }

    /**
     * Clears all current grid filters
     */
    private clearFilters() {
        this.setState({ filters: {} });
    }

    /**
     * Handles failures during grid initialization
     * @param {{exception: string}} error
     */
    private failureCallback(error: { exception: string }) {
        console.warn(`Data retrieval failed: ${error.exception}`);
        this.setState({ isLoading: false });
    }

    /**
     * Returns the row information from the state for the passed visual index
     * @param {number} index
     * @returns {Object}
     */
    private getRow(index: number) {
        return ReactDataGridPlugins.Data.Selectors.getRows(this.state)[index];
    }

    /**
     * Returns the number of rows in the data set
     * @returns {number}
     */
    private getRowCount() {
        return ReactDataGridPlugins.Data.Selectors.getRows(this.state).length;
    }

    /**
     * Returns the filter values to display for column with the passed id
     * @param columnId
     * @returns {any[]}
     */
    private getValidFilterValues(columnId: any) {
        return _.uniq(this.state.rows
            .map((r) => r[columnId]))
            .filter((r) => r != null)
            .sort();
    }

    /**
     * Dynamically loads the columns in the grid from the passed set of column metadata
     * @param {Array<{ caption: string, name: string, sortable: boolean }>} columns
     * @returns {ReactDataGrid.Column[]}
     */
    private loadColumns(columns: Array<{ caption: string, name: string, sortable: boolean }>) {
        return columns.map((cm) => {
            const c: ReactDataGrid.Column = {
                key:        cm.name,
                name:       cm.caption,
                resizable:  true,
                sortable:   cm.sortable,
            };
            // do not add filters to columns that are blacklisted (e.g., '^Column Name'), but do add
            // filters for columns that are whitelisted and the default filter (i.e., '*')
            if (!this.gridFilters.hasOwnProperty(`^${c.name}`)
                    && (this.gridFilters.hasOwnProperty(c.name) || this.gridFilters.hasOwnProperty('*'))) {
                c.filterable     = true;
                c.filterRenderer = this.gridFilters[c.name] || this.gridFilters['*'];
            }
            return c;
        });
    }

    /**
     * Sorts the grid based on the passed column and direction
     * @param {string} sortColumn
     * @param {"ASC" | "DESC" | "NONE"} sortDirection
     */
    private sort(sortColumn: string, sortDirection: 'ASC' | 'DESC' | 'NONE') {
        this.setState({ sortColumn, sortDirection });
    }

    /**
     * Loads the rows into the component state following a successful retrieval from the database
     * @param data
     */
    private successCallback(data: any) {
        const rows = [];
        for (let i = 1; i <= data.getRowCount(); i++) {
            const row = data.getRow(i - 1);
            const obj = { rowId: i } as any;
            this.gridColumns.forEach((v) => obj[v.key] = row.getValue(v.key) || '');
            rows.push(obj);
        }
        this.setState({rows, isLoading: false});
    }
}

/** State definition for the main breeding module component */
interface BreedingState {
    filters: any;
    isLoading: boolean;
    rows: any[];
    sortColumn: string | null;
    sortDirection: 'ASC' | 'DESC' | 'NONE' | null;
}

/** Component used to display the detail for the main breeding component rows */
class MasterDetailExpandView extends React.Component<{row?: { rowId: string }}, {}> {
    public render() {
        const rowId = this.props.row && this.props.row.rowId;
        return (<div className="panel-body react-grid-Cell">Some detail about row: {rowId}.</div>);
    }
}
