import * as React from "react";
import {SpeciesProtocolInfo} from "../protocol";
import {Drug, DrugForm} from "../protocol/drug";

export interface DrugsSectionProps {
    info: SpeciesProtocolInfo
}

export class DrugsSection extends React.Component<DrugsSectionProps, {}> {
    private _drugs: KnockoutObservableArray<Drug>;
    private _subscription: KnockoutSubscription;

    constructor(props: DrugsSectionProps) {
        super(props);

        this._drugs = props.info.drugs;



        this.addDrug = this.addDrug.bind(this);
    }

    componentWillMount() {
        this._subscription = this._drugs.subscribe(() => {
            this.forceUpdate();
        });
    }

    componentWillUnmount() {
        if (this._subscription) {
            this._subscription.dispose();
        }
    }

    addDrug(): void {
        this._drugs.push(new Drug());
    }

    render() {
        let drugs = this._drugs().map((drug: Drug, index: number) => {
            return (
                <div key={drug.id} >
                    <DrugForm drug={drug}/>
                    {(index !== this._drugs().length - 1) && (<hr/>) }
                </div>

            );
        });

        return (
            <div className="panel panel-primary container-fluid">
                <div className="panel-heading row">
                    Drugs
                    <div className="pull-right">
                        <button className="btn btn-success" onClick={this.addDrug}>
                            <i className="fa fa-plus-square" style={{marginRight: '5px'}}/>
                            New
                        </button>
                    </div>

                </div>
                <div className="panel-body">
                    {drugs}
                </div>
            </div>
        )
    }
}