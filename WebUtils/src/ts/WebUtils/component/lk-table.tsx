import * as _ from "underscore";
import * as $ from "jquery";
import * as ko from "knockout";
import * as React from "react";
import * as ReactDOM from "react-dom";
import * as ReactDomServer from "react-dom/server";
import CSSProperties = React.CSSProperties;
import {Table} from "../model/Table";
import {TableRow} from "../model/TableRow";
import {Filterer} from "simplefilter";

export class FilterableTableColumn extends React.Component<{'cellData': any}, {}> {
    render() {
        let data = this.props.cellData;
        let html = _.isObject(data) ? data.display : data;

        return <td>
            <span dangerouslySetInnerHTML={{ __html: html }} />
        </td>
    }
}

export class FilterableTableRow extends React.Component<{'row': TableRow}, {}> {
    render() {
        let data = this.props.row.rowData;

        let columns = data.map((cellData, i) => {
            return <FilterableTableColumn cellData={cellData} key={i} />
        });

        return <tr>
            {columns}
        </tr>;
    }
}

export interface FilterableTableViewModel {
    table: Table
}

export interface FilterableTableState {
    filters: {[name: string]: string}
}

export class FilterableTable extends React.Component<FilterableTableViewModel, FilterableTableState> {
    constructor(props) {
        super(props);

        this.state = {
            filters: {}
        };

        this.handleFilterChange = this.handleFilterChange.bind(this);
    }

    handleFilterChange(event) {
        let $target = $(event.target);
        let filters = this.state.filters;
        filters[$target.attr('data-column-number')] = $target.val();

        this.setState({filters:  filters});
    }

    render() {
        let table = this.props.table;

        let state = this.state as FilterableTableState;

        let headers = table.rowHeaders().map((header, i) => {
            return <th className="header" key={i}>
                {header}
            </th>;
        });

        let filters = table.rowHeaders().map((filter, i) => {
            return (
                <td key={i}>
                    <div className="input-group">
                        <input className="form-control input-sm" placeholder="No active filter" type="text" onChange={this.handleFilterChange} {...{'data-column-number': i}}/>
                        <span className="input-group-addon">
                            <span className="glyphicon glyphicon-info-sign" data-toggle="modal"></span>
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
        let rows = table.rows().filter((row) => {
            let data = row.rowData;

            // For each filter, return a failure if we failed to match.
            for (let filteredColumnIndex in filterers) {
                let filter = filterers[filteredColumnIndex];

                if (!filter.matches(row.getValueForColumnIndex(parseInt(filteredColumnIndex)))) {
                    row.isHidden(true);
                    return false;
                }
            }

            row.isHidden(false);
            return true;
        }).map((row, i) => {
            return <FilterableTableRow row={row} key={i} />;
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
        </div>;
    }
}

let koTemplate = ReactDomServer.renderToString((<div className="lk-table-react"> </div>));

export interface FilterableTableParams {
    table: Table
}

export function registerKoComponent(): void {
    ko.components.register('lk-table', {
        viewModel: {
            createViewModel: function(params: FilterableTableParams, componentinfo) {
                if (componentinfo) {
                    let $element = $(componentinfo.element).find('.lk-table-react');

                    ReactDOM.render(
                        <FilterableTable table={params.table} />,
                        $element.get(0)
                    )
                }

            }
        },
        template: koTemplate
    });
}