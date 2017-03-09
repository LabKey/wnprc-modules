import * as _ from "underscore";
import * as $ from "jquery";
import * as ko from "knockout";
import * as React from "react";
import * as ReactDOM from "react-dom";
import * as ReactDomServer from "react-dom/server";
import CSSProperties = React.CSSProperties;
import {Table} from "../model/Table";
import {TableRow} from "../model/TableRow";

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

export class FilterableTable extends React.Component<FilterableTableViewModel, {}> {
        render() {
                let table = this.props.table;
                let shownRows = 0;//TODO; implement

                let headers = table.rowHeaders().map((header, i) => {
                        return <th className="header" key={i}>
                                {header}
                        </th>;
                });

                let rows = table.rows().map((row, i) => {
                        return <FilterableTableRow row={row} key={i} />;
                });

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