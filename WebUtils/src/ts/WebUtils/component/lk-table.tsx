import * as _ from "underscore";
import * as $ from "jquery";
import ko from "../externals/knockout-enhanced";
import * as React from "react";
import * as ReactDOM from "react-dom";
import * as ReactDomServer from "react-dom/server";
import CSSProperties = React.CSSProperties;
import {Table} from "../model/Table";
import {TableRow, TableColumn, isHTMLTableColumn} from "../model/TableRow";
import {Filterer} from "simplefilter";
import ChangeEvent = React.ChangeEvent;

export class FilterableTableColumn extends React.Component<{'cellData': TableColumn}, {}> {
    render() {
        let column = this.props.cellData;

        if (isHTMLTableColumn(column)) {
            return (
                <td>
                    <span dangerouslySetInnerHTML={{ __html: column.getHTML() }} />
                </td>
            );
        }
        else {
            return (
                <td>
                    {column.getReactElement()}
                </td>
            );
        }
    }
}

export interface FilterableTableRowProps {
    row: TableRow,
    handleClick?: (data: any) => void
}

export class FilterableTableRow extends React.Component<FilterableTableRowProps, {}> {
    render() {
        let data = this.props.row.columns;

        let columns = data.map((cellData: TableColumn, i: number) => {
            return <FilterableTableColumn cellData={cellData} key={i} />
        });

        return (
            <tr onClick={(e) => {_.isFunction(this.props.handleClick) && this.props.handleClick(this.props.row.otherData) ; e.preventDefault();}}>
                {columns}
            </tr>
        );
    }
}

export interface FilterableTableViewModel {
    table: Table,
    handleRowClick?: (data: any) => void
}

export interface FilterableTableState {
    filters: {[name: string]: string}
}

export class FilterableTable extends React.Component<FilterableTableViewModel, FilterableTableState> {
    constructor(props: FilterableTableViewModel) {
        super(props);

        this.state = {
            filters: {}
        };

        // Update the table if the table starts or stops loading.
        this.props.table.isLoading.subscribe(() => {
            this.forceUpdate();
        });

        this.props.table.rows.subscribe(() => {
            this.forceUpdate();
        });

        this.handleFilterChange = this.handleFilterChange.bind(this);
    }

    handleFilterChange(event: ChangeEvent<HTMLElement>) {
        let $target = $(event.target);
        let filters = this.state.filters;

        let column_no = $target.attr('data-column-number');
        let filterValue = $target.val();
        if (column_no && filterValue) {
            filters[column_no] = _.isArray(filterValue) ? filterValue.join(' ') : `${filterValue}`;
        }

        this.setState({filters:  filters});
    }

    render() {
        let table = this.props.table;
        let state = this.state as FilterableTableState;

        let headers = table.rowHeaders().map((header: string | TableColumn, i: number) => {
            if (_.isString(header)) {
                return (
                    <th className="header" key={i}>
                        {header}
                    </th>
                );
            }
            else {
                return (
                    <th className="header" key={i}>
                        <FilterableTableColumn cellData={header} />
                    </th>
                );
            }
        });

        let filters = table.rowHeaders().map((neverUsed: any, i: number) => {
            return (
                <td key={i}>
                    <div className="input-group">
                        <input className="form-control input-sm" placeholder="No active filter" type="text" onChange={this.handleFilterChange} {...{'data-column-number': i}}/>
                        <span className="input-group-addon">
                            <span className="glyphicon glyphicon-info-sign"></span>
                        </span>
                    </div>
                </td>
            );
        });

        let filterers: {[name: string]: Filterer} = {};
        for (let filteredColumnIndex in this.state.filters) {
            let filterString = this.state.filters[filteredColumnIndex];

            filterers[filteredColumnIndex] = new Filterer(filterString);
        }

        // Get the filtered rows.
        let rows = table.rows().filter((row: TableRow) => {
            let data: TableColumn[] = row.columns;

            // For each filter, return a failure if we failed to match.
            for (let filteredColumnIndex in filterers) {
                let filter = filterers[filteredColumnIndex];
                let column = data[parseInt(filteredColumnIndex)];
                let cellValue = _.isString(column.getValue()) ? column.getValue() : "";

                if (!filter.matches(cellValue)) {
                    row.isHidden(true);
                    return false;
                }
            }

            row.isHidden(false);
            return true;
        }).map((row: TableRow, i: number) => {
            return <FilterableTableRow row={row} key={row.key} handleClick={this.props.handleRowClick} />;
        });

        let shownRows = rows.length;

        return <div className="panel panel-default">
            <div className="panel-heading">
                <div className="container-fluid panel-container">
                    <div className="col-xs-8 text-left">

                    </div>

                    <div className="col-xs-4 text-right">
                        <p><strong>Displaying {shownRows} / {table.rows().length} rows.</strong></p>
                    </div>
                </div>
            </div>

            {table.isLoading() && (
                <div className="text-center">
                    <h4>
                        <i className="fa fa-spinner fa-spin"></i>
                        Table is Loading...
                    </h4>
                </div>
            )}

            {!table.isLoading() && (
                <div>
                    <table className="table table-striped table-bordered table-hover">
                        <thead>
                        <tr>
                            {headers}
                        </tr>
                        </thead>

                        <tbody>
                        <tr className="noclick">
                            {filters}
                        </tr>

                        {rows}
                        </tbody>
                    </table>

                    {(rows.length == 0) && (
                        <div className="text-center">
                            <h4>No Rows to Display</h4>
                        </div>
                    )}
                </div>
            )}
        </div>;
    }
}

export interface FilterableTableParams {
    table: Table
}

export function registerKoComponent(): void {
    let componentName = "lk-table";

    if (!ko.components.isRegistered(componentName)) {
        ko.components.register(componentName, {
            viewModel: {
                createViewModel: function(params: FilterableTableParams, componentinfo: any) {
                    if (componentinfo) {
                        let $element = $(componentinfo.element).find('.lk-table-react');

                        ReactDOM.render(
                            <FilterableTable table={params.table} />,
                            $element.get(0)
                        )
                    }

                }
            },
            template: '<div class="lk-table-react"></div>'
        });
    }
}