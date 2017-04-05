import * as React from "react";
import Component = React.Component;
import * as moment from "moment";
import Moment = moment.Moment;
import {NecropsyDetailsForm, URLForAction} from "../../../../../build/generated-ts/GeneratedFromJava";
import * as api from "WebUtils/API";
import {urlFromAction} from "../../../../../lkpm/modules/Compliance/lkpm/modules/WebUtils/src/ts/WebUtils/LabKey";
import * as s from "underscore.string";

export interface NxDetailsPanelProps {
    necropsyLsid: string | null;
}

export interface NxDetailsPanelState {
    form: NecropsyDetailsForm | null
}

const detailsURL: URLForAction = new URLForAction();
detailsURL.controller = 'wnprc_ehr-necropsy';
detailsURL.actionName = 'getNecropsyInfo';

export class NxDetailsPanel extends Component<NxDetailsPanelProps, NxDetailsPanelState> {
    constructor(props: NxDetailsPanelProps) {
        super(props);

        this.state = {
            form: new NecropsyDetailsForm()
        };
    }

    componentWillReceiveProps(nextProps: NxDetailsPanelProps) {
        if (nextProps.necropsyLsid != this.props.necropsyLsid && nextProps.necropsyLsid != null) {
            let url = urlFromAction(detailsURL, {
                'necropsy-lsid': nextProps.necropsyLsid
            });

            this.setState({
                form: null
            }, () => {
                api.getJSON(url, {}).then((json: any) => {
                    let form = NecropsyDetailsForm.fromJSON(json);

                    this.setState({
                        form: form
                    });
                })
            });
        }
    }

    render() {
        let instructions = (
            <p style={{fontStyle: 'italic'}}>
                Please click on a Necropsy in the Calendar to view details for that Necropsy.
            </p>
        );

        let form: NecropsyDetailsForm | null = this.state.form;

        let displayDate = (form == null || form.scheduledDate == null) ? "" : form.scheduledDate.calendar(undefined, {
            sameElse: 'MMM D[,] YYYY'
        });

        let details = form == null ? (
            <div className="text-center">
                <i className="fa fa-spinner fa-pulse fa-fw"></i>
                <strong>Loading...</strong>
            </div>
        ) : (
            <div>
                {
                    form.hasTissuesForAVRL && (
                        <div className="alert alert-warning" role="alert">
                            <span className="glyphicon glyphicon-alert"></span>
                            This animal has tissue samples that need to be couried to AVRL.
                        </div>
                    )
                }

                <dl className="dl-horizontal">
                    <dt>Task ID:            </dt> <dd>{form.taskId}</dd>
                    <dt>Animal ID:          </dt> <dd><a href="#">{form.animalId}</a></dd>
                    <dt>Project (Account):  </dt> <dd>{form.project} ({form.account})</dd>
                    <dt>Protocol:           </dt> <dd>{form.protocol}</dd>
                    <dt>Necropsy Date:      </dt> <dd>{displayDate}</dd>
                    <dt>Nx Location:        </dt> <dd>{form.necropsyLocation}</dd>
                    <dt>Who Delivers to Nx: </dt> <dd>{form.whoDeliversToNx}</dd>
                    <dt>Delivery Comment:   </dt> <dd>{form.deliveryComment}</dd>

                    {
                        (!s.isBlank(form.currentRoom) && !s.isBlank(form.currentCage)) && (
                            <div>
                                <dt>Current Room:       </dt> <dd>{form.currentRoom}</dd>
                                <dt>Current Cage:       </dt> <dd>{form.currentCage}</dd>
                                <dt>Housing Type:       </dt> <dd>{form.housingType}</dd>
                            </div>

                        )
                    }

                </dl>
            </div>
        );

        return (
            <div className="panel panel-primary">
                <div className="panel-heading">
                    Necropsy Details
                </div>

                <div className="panel-body" >
                    { (this.props.necropsyLsid == null) ? instructions : details }
                </div>
            </div>
        )
    }
}

