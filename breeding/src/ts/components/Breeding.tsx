import {GridViewSelector} from './GridViewSelector';

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

    /** Define the filter renderers available for the grid */
    private gridFilters: ReactDataGridFilterSpec = {
        '*': ReactDataGridPlugins.Filters.AutoCompleteFilter,
    };

    /** Query configuration data. Lists the schema, query name (name), and (optionally) the view */
    private query: ReactDataGridQuerySpec = {
        name:   'arrival',
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
        this.reloadGrid             = this.reloadGrid.bind(this);
        this.setView                = this.setView.bind(this);
        this.sort                   = this.sort.bind(this);
        this.successCallback        = this.successCallback.bind(this);

        this.state   = {
            columns:        [],
            filters:        {},
            hasError:       false,
            isLoading:      true,
            rows:           [],
            sortColumn:     null,
            sortDirection:  null,
            view:           null,
            views:          [],
        };
    }

    public componentWillMount() {
        this.reloadGrid(true);
    }

    public render() {
        const options = this.state.views.map((v) => ({value: v.name, label: v.label || '(default)'}));
        return (
            <div>
                { !this.state.hasError ? null : (
                    <div className="alert alert-danger">
                        The page has encountered an error. Please try again or contact Informatics and Data Services.
                    </div>)
                }
                <MasterDetailDataGrid
                    columns={this.state.columns}
                    detailRenderer={<MasterDetailExpandView/>}
                    getValidFilterValues={this.getValidFilterValues}
                    minHeight={500}
                    onAddFilter={this.changeFilters}
                    onClearFilters={this.clearFilters}
                    onGridSort={this.sort}
                    rowsCount={this.getRowCount()}
                    rowGetter={this.getRow}
                    toolbar={
                        <ReactDataGridPlugins.Toolbar enableFilter={true}>
                            <GridViewSelector setView={this.setView} options={options}/>
                        </ReactDataGridPlugins.Toolbar>}
                />
                {this.state.isLoading ? <LoadingOverlay message={this.state.loadMessage}/> : null}
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
        console.error(`There was an error loading the the component: ${error.exception}`);
        this.setState({ hasError: true, isLoading: false });
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
     * @param {LabkeyQueryFieldMetaData[]} columns
     * @returns {ReactDataGrid.Column[]}
     */
    private loadColumns(columns: LabkeyQueryFieldMetaData[]) {
        return columns.map((cm) => {
            const c: ReactDataGrid.Column = {
                key: cm.name,
                name: _.capitalize(cm.caption || cm.name),
                resizable: true,
                sortable: cm.sortable,
            };
            // do not add filters to columns that are blacklisted (e.g., '^Column Name'), but do add
            // filters for columns that are whitelisted and the default filter (i.e., '*')
            if (!this.gridFilters.hasOwnProperty(`^${c.name}`)
                && (this.gridFilters.hasOwnProperty(c.name) || this.gridFilters.hasOwnProperty('*'))) {
                c.filterable = true;
                c.filterRenderer = this.gridFilters[c.name] || this.gridFilters['*'];
            }
            return c;
        });
    }

    /**
     * Reloads the entire grid, including the columns and a new row request
     * @param {boolean} first
     */
    private reloadGrid(first: boolean) {
        this.setState({isLoading: true, loadMessage: 'Loading query details...'});
        LABKEY.Query.getQueryDetails({
            failure:    this.failureCallback,
            queryName:  this.query.name,
            schemaName: this.query.schema,
            success:    (info: LabkeyQueryInfo) => {
                if (first) {
                    this.setState({
                        views: info.views
                            .filter((v) => !v.hidden)
                            .sort((a, b) => (a.label || '').localeCompare(b.label || '')),
                    });
                }
                const viewName = this.state.view && this.state.view.value;
                const view = (viewName && _.head(info.views.filter((v) => v.name === viewName)))
                    || info.defaultView;
                this.setState({ columns: this.loadColumns(view.columns), loadMessage: 'Requesting data...' });
                LABKEY.Query.selectRows({
                    failure:            this.failureCallback,
                    queryName:          this.query.name,
                    requiredVersion:    13.2,
                    schemaName:         this.query.schema,
                    success:            this.successCallback,
                    timeout:            5000,
                    viewName:           view.name,
                });
            },
            viewName:   '*',
        });
    }

    /**
     * Sets the view to the passed view name (based on the dropdown selection)
     * @param {{label: string; value: string}} selectedItem
     */
    private setView(selectedItem: { label: string, value: string }) {
        this.setState({ view: selectedItem });
        this.reloadGrid(false);
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
        this.setState({loadMessage: 'Rendering data...'});
        const rows = [];
        for (let i = 1; i <= data.getRowCount(); i++) {
            const row = data.getRow(i - 1);
            const obj = { rowId: i } as any;
            this.state.columns.forEach((v) => obj[v.key] = row.getValue(v.key) || '');
            rows.push(obj);
        }
        this.setState({rows, loadMessage: undefined, isLoading: false});
    }
}

/** State definition for the main breeding module component */
interface BreedingState {
    columns: ReactDataGrid.Column[];
    filters: any;
    hasError: boolean;
    isLoading: boolean;
    loadMessage?: string;
    rows: any[];
    sortColumn: string | null;
    sortDirection: 'ASC' | 'DESC' | 'NONE' | null;
    view: { value: string, label: string } | null;
    views: LabkeyViewMetaData[];
}

/** Type definition for the LABKEY.Query.FieldMetaData */
interface LabkeyQueryFieldMetaData {
    caption: string;
    name: string;
    sortable: boolean;
}

/** Type definition for LABKEY.Query.QueryInfo */
interface LabkeyQueryInfo {
    schemaName: string;
    name: string;
    title: string;
    columns: LabkeyQueryFieldMetaData[];
    defaultView: LabkeyViewMetaData;
    views: LabkeyViewMetaData[];
}

/** Type definition for the Labkey view metadata */
interface LabkeyViewMetaData {
    columns: LabkeyQueryFieldMetaData[];
    name: string;
    hidden: boolean;
    label: string;
}

/** Component used to display the detail for the main breeding component rows */
class MasterDetailExpandView extends React.Component<{row?: { rowId: string }}, {}> {
    public render() {
        const rowId = this.props.row && this.props.row.rowId;
        return (<div className="panel-body react-grid-Cell">Some detail about row: {rowId}.</div>);
    }
}
