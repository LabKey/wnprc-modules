declare const LABKEY: any;

import * as _ from "lodash";
import * as React from "react";
import * as ReactDataGrid from "react-data-grid";
import * as ReactDataGridPlugins from "react-data-grid-addons";

import { MasterDetailDataGrid } from "./react-data-grid/MasterDetailDataGrid";

class MasterDetailExpandView extends React.Component<{row?: any}, {}> {
    render() {
        return (
            <div className="panel-body react-grid-Cell">Some detail about row: {this.props.row.id}.</div>
        );
    }
}

export class Breeding extends React.Component<any, any> {

    private columns: ReactDataGrid.Column[];

    private loadStyle: React.CSSProperties =
    {
        backgroundColor: 'rgba(51,122,183,0.10)',
        position: 'absolute',
        top:      0,
        left:     0,
        height:   '100%',
        width:    '100%',
        zIndex:   10
    };
    private spinStyle: React.CSSProperties =
    {
        fontSize: '6em',
        position: 'absolute',
        bottom:   20,
        right:    20,
        top:      'auto'
    };

    constructor(props: any, context: any) {
        super(props, context);

        this.columns = [
            {
                key:            'FirstName',
                name:           'First Name',
                filterable:     true,
                filterRenderer: ReactDataGridPlugins.Filters.AutoCompleteFilter,
                sortable:       true,
                width:          200
            },
            {
                key:            'LastName',
                name:           'Last Name',
                filterable:     true,
                filterRenderer: ReactDataGridPlugins.Filters.AutoCompleteFilter,
                sortable:       true,
                width:          200
            },
            {
                key:            'Email',
                name:           'Email',
                sortable:       true,
                width:          200
            },
            {
                key:            'LastLogin',
                name:           'Last Login',
                sortable:       true,
                width:          200
            }
        ];
        this.state = {
            filters:        {},
            isLoading:      true,
            rows:           [],
            sortColumn:     null,
            sortDirection:  null
        };
    }

    rowGetter = (index: number) => {
        return ReactDataGridPlugins.Data.Selectors.getRows(this.state)[index];
    };

    rowsCount = () => {
        return ReactDataGridPlugins.Data.Selectors.getRows(this.state).length;
    };

    handleFilterChange = (filter: any) => {
        let newFilters = _.assign({}, this.state.filters);
        if (filter.filterTerm) {
            newFilters[filter.column.key] = filter;
        } else {
            delete newFilters[filter.column.key];
        }
        this.setState({ filters: newFilters });
    };

    handleGridSort = (sortColumn: string, sortDirection: 'ASC' | 'DESC' | 'NONE') => {
        this.setState({ sortColumn: sortColumn, sortDirection: sortDirection });
    };

    getValidFilterValues = (columnId: any) => {
        return _.uniq(this.state.rows.map((r: any[]) => r[columnId] || "(empty)"));
    };

    handleOnClearFilters = () => {
        this.setState({ filters: {} });
    };

    componentWillMount() {
        LABKEY.Query.selectRows({
            schemaName:         'core',
            queryName:          'users',
            columns:            [ 'FirstName', 'LastName', 'Email', 'LastLogin' ],
            success:            this.onDataLoaded,
            failure:            this.onDataFailed,
            timeout:            5000,
            requiredVersion:    13.2
        });
    }

    onDataFailed = (errorInfo: { exception: string, exceptionClass: string, stackTrace: string }, responseObj: XMLHttpRequestResponseType, options: any) => {
        console.error(`Data retrieval failed: ${errorInfo.exception}`);
        this.setState({ isLoading: false });
    };

    onDataLoaded = (data: any) => {
        setTimeout(() => {
            let rows = [];
            for (let i = 1; i <= data.getRowCount(); i++) {
                let row = data.getRow(i - 1);
                rows.push({
                    id: i,
                    'FirstName': row.getValue('FirstName') || "",
                    'LastName':  row.getValue('LastName')  || "",
                    'Email':     row.getValue('Email')     || "",
                    'LastLogin': row.getValue('LastLogin') || ""
                });
            }
            this.setState({rows: rows, isLoading: false});
        }, 2000);
    };

    render() {
        return (
            <div>
                <MasterDetailDataGrid
                    columns              = {this.columns}
                    detailRenderer       = {<MasterDetailExpandView/>}
                    getValidFilterValues = {this.getValidFilterValues}
                    minHeight            = {500}
                    onAddFilter          = {this.handleFilterChange}
                    onClearFilters       = {this.handleOnClearFilters}
                    onGridSort           = {this.handleGridSort}
                    rowsCount            = {this.rowsCount()}
                    rowGetter            = {this.rowGetter}
                    toolbar              = {<ReactDataGridPlugins.Toolbar enableFilter={true}/>}
                />
                {
                    this.state.isLoading ? [
                        (<div  style={this.loadStyle}/>),
                        (<span style={this.spinStyle} className="glyphicon glyphicon-refresh spinning text-primary"/>)
                    ] : null
                }
            </div>);
    }
}