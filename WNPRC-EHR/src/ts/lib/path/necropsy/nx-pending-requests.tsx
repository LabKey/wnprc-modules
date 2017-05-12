import * as React from "react";
import Component = React.Component;
import * as moment from "moment";
import Moment = moment.Moment;
import {NecropsyRequestForm, NecropsyRequestListForm} from "../../../../../build/generated-ts/GeneratedFromJava";
import * as api from "WebUtils/API";
import {URLForAction} from "../../../../../lkpm/modules/WebUtils/build/generated-ts/GeneratedFromJava";
import {urlFromAction} from "WebUtils/LabKey";
import {TableRow, SimpleStringColumn} from "WebUtils/model/TableRow";
import {Table} from "WebUtils/model/Table";
import {FilterableTable} from "WebUtils/component/lk-table";

interface NxPendingRequestsPanelProps {
    handleClick: (data: any) => void
}

interface NxPendingRequestsPanelState {
    requests: NecropsyRequestForm[],
    loading:  boolean
}


const requestsListURL: URLForAction = new URLForAction();
requestsListURL.controller = 'wnprc_ehr-necropsy';
requestsListURL.actionName = 'getNecropsyRequests';

export class NxPendingRequestsPanel extends Component<NxPendingRequestsPanelProps, NxPendingRequestsPanelState> {
    constructor() {
        super();

        this.state = {
            requests: [],
            loading: true
        };

        this.handleLoad = this.handleLoad.bind(this);
        this.reload = this.reload.bind(this);
        this._load = this._load.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this)
    }

    componentDidMount() {
        this.reload();
    }

    handleLoad(data: NecropsyRequestListForm) {
        this.setState({
            requests: data.requests || [],
            loading:  false
        });
    }

    reload() {
        this.setState({loading: true});
        this._load();
    }

    private _load() {
        let url: string = urlFromAction(requestsListURL);

        api.getJSON(url, {}).then((data: any) => {
            this.handleLoad(NecropsyRequestListForm.fromJSON(data))
        });
    }

    render() {
        let rows: TableRow[] = this.state.requests.map((request: NecropsyRequestForm) => {
            let displayDate = (m: Moment) => {
                if (!m) {
                    return '';
                }

                return m.calendar(undefined, {
                    sameElse: 'MMM D[,] YYYY'
                })
            };

            return new TableRow({
                columns: [
                    new SimpleStringColumn(request.requestId),
                    new SimpleStringColumn(request.priority),
                    new SimpleStringColumn(request.animalId),
                    new SimpleStringColumn(request.requestedBy),
                    new SimpleStringColumn(displayDate(request.requestedOn)),
                    new SimpleStringColumn(displayDate(request.requestedFor))
                ],
                otherData: {
                    lsid: request.requestLsid
                },
                warn: (request.priority == 'ASAP'),
                err:  (request.priority == 'Stat')
            })
        });

        let table: Table = new Table({
            rowHeaders: ['Request ID', 'Priority', 'Animal ID', 'Requested By', 'Requested On', 'Requested For'],
            rows: rows
        });

        return (
            <div className="panel panel-primary">
                <div className="panel-heading">Pending Requests</div>

                <div className="panel-body">
                    {
                        (this.state.loading) ? (
                            <div className="text-center">
                                <p>
                                    <i className="fa fa-spinner fa-pulse fa-fw"></i> Loading...
                                </p>
                            </div>
                        ) : (this.state.requests.length == 0) ? (
                            <p>
                                There are no requests pending.
                            </p>
                        ) : (
                            <div>
                                <p>
                                    Requests are color-coded based on priority.  <span className="bg-danger">Stat</span> requests are
                                    highlighted in <span className="bg-danger">red</span> and <span className="bg-warning">ASAP</span> requests
                                    are highlighted in <span className="bg-warning">yellow</span>.
                                </p>
                            </div>
                        )
                    }
                </div>

                {(!this.state.loading && this.state.requests.length > 0) && (
                    <FilterableTable table={table} handleRowClick={this.props.handleClick || undefined}/>
                )}
            </div>
        );
    }
}