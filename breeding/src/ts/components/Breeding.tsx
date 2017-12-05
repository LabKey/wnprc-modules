declare const LABKEY: any;

import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDataGrid from 'react-data-grid';
import * as ReactDataGridPlugins from 'react-data-grid-addons';

import { LoadingOverlay } from './LoadingOverlay';
import { MasterDetailDataGrid } from './react-data-grid/MasterDetailDataGrid';

export class Breeding extends React.Component<any, BreedingState> {

    private gridColumns: ReactDataGrid.Column[];
    private gridFilters: any = {
        Id:           ReactDataGridPlugins.Filters.AutoCompleteFilter,
        Investigator: ReactDataGridPlugins.Filters.AutoCompleteFilter,
    };
    private query = {
        name:   'ActiveAssignments',
        schema: 'study',
    };

    constructor(props: any, context: any) {
        super(props, context);

        this.changeFilters      = this.changeFilters.bind(this);
        this.clearFilters       = this.clearFilters.bind(this);
        this.failureCallback    = this.failureCallback.bind(this);
        this.getRow             = this.getRow.bind(this);
        this.getRowCount        = this.getRowCount.bind(this);
        this.loadColumns        = this.loadColumns.bind(this);
        this.sort               = this.sort.bind(this);
        this.successCallback    = this.successCallback.bind(this);

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

    private changeFilters(filter: any) {
        const newFilters = _.assign({}, this.state.filters);
        if (filter.filterTerm) {
            newFilters[filter.column.key] = filter;
        } else {
            delete newFilters[filter.column.key];
        }
        this.setState({ filters: newFilters });
    }

    private clearFilters() {
        this.setState({ filters: {} });
    }

    private failureCallback(error: { exception: string }) {
        console.warn(`Data retrieval failed: ${error.exception}`);
        this.setState({ isLoading: false });
    }

    private getRow(index: number) {
        return ReactDataGridPlugins.Data.Selectors.getRows(this.state)[index];
    }

    private getRowCount() {
        return ReactDataGridPlugins.Data.Selectors.getRows(this.state).length;
    }

    private getValidFilterValues(columnId: any) {
        return _.uniq(this.state.rows.map((r: any[]) => r[columnId])).sort();
    }

    private loadColumns(columns: Array<{ name: string, caption: string, sortable: boolean }>) {
        return columns.map((cm) => {
            const c: ReactDataGrid.Column = {
                key:        cm.name,
                name:       cm.caption,
                resizable:  true,
                sortable:   cm.sortable,
            };
            if (this.gridFilters[c.name]) {
                c.filterable     = true;
                c.filterRenderer = this.gridFilters[c.name];
            }
            return c;
        });
    }

    private sort(sortColumn: string, sortDirection: 'ASC' | 'DESC' | 'NONE') {
        this.setState({ sortColumn, sortDirection });
    }

    private successCallback(data: any) {
        const rows = [];
        for (let i = 1; i <= data.getRowCount(); i++) {
            const row = data.getRow(i - 1);
            const obj = { rowId: i } as any;
            this.gridColumns.forEach((v) => obj[v.key] = row.getValue(v.key));
            rows.push(obj);
        }
        this.setState({rows, isLoading: false});
    }
}

interface BreedingState {
    filters: any;
    isLoading: boolean;
    rows: any[];
    sortColumn: string | null;
    sortDirection: 'ASC' | 'DESC' | 'NONE' | null;
}

class MasterDetailExpandView extends React.Component<{row?: { rowId: string }}, {}> {
    public render() {
        const rowId = this.props.row && this.props.row.rowId;
        return (<div className="panel-body react-grid-Cell">Some detail about row: {rowId}.</div>);
    }
}
