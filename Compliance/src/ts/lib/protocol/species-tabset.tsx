import * as React from "react";
import * as _ from "underscore";
import * as ko from "knockout";
import * as $ from "jquery";
import ChangeEvent = React.ChangeEvent;
import MouseEvent  = React.MouseEvent;
import {Protocol, SpeciesProtocolInfo} from "./protocol";

import * as ReactTabs from 'react-tabs';
import TabList = ReactTabs.TabList;
import Tabs = ReactTabs.Tabs;
import TabPanel = ReactTabs.TabPanel;
import Tab = ReactTabs.Tab;

export interface SpeciesSelectorProps {
    options: {[name: string]: string};
    selectedSpecies: KnockoutObservableArray<string>;
    handleButtonClick?(optionValue: string): void;
}

interface SpeciesSelectorState {
    value: string
}

export class SpeciesSelector extends React.Component<SpeciesSelectorProps, SpeciesSelectorState> {
    constructor(props: SpeciesSelectorProps) {
        super(props);

        this.state = {value: ""};

        this.handleChange = this.handleChange.bind(this);
        this.handleClick = this.handleClick.bind(this);
    }

    handleChange(e: ChangeEvent<HTMLSelectElement>) {
        this.setState({
            value: e.target.value
        });
    }

    handleClick(e: MouseEvent<HTMLButtonElement>) {
        if (this.props.handleButtonClick) {
            this.props.handleButtonClick(this.state.value);
        }

        e.preventDefault();
    }

    render() {
        let options = _.keys(this.props.options).filter((keyName: string) => {
            return this.props.selectedSpecies.indexOf(keyName) === -1;
        }).map((keyName: string) => {
            return (
                <option key={keyName} value={keyName}>{this.props.options[keyName]}</option>
            );
        });

        return (
            <form className="form-inline">
                <div className="form-group">
                    <select value={this.state.value} onChange={this.handleChange} className="form-control" placeholder="Please Select a Species">
                        <option value="" style={{fontStyle: 'italic'}}>Please Select a Species</option>
                        {options}
                    </select>
                </div>

                <button style={{marginLeft: '5px'}} disabled={this.state.value == ""} className="btn btn-primary" onClick={this.handleClick}>Add Species</button>
            </form>
        )
    }
}

interface ProtocolSpeciesTabProps {
    info: SpeciesProtocolInfo
}

class ProtocolSpeciesTab extends React.Component<ProtocolSpeciesTabProps, {}> {
    render() {
        return (
            <div>
                <h1>This is a species tab for {this.props.info.species_classifier}.</h1>
            </div>
        )
    }
}

export interface ProtocolSpeciesTabsetProps {
    protocol: Protocol,
    speciesOptions: {[name: string]: string}
}

export class ProtocolSpeciesTabset extends React.Component<ProtocolSpeciesTabsetProps, {}> {
    selectedSpecies: KnockoutObservableArray<string> = ko.observableArray([]);

    constructor(props: ProtocolSpeciesTabsetProps) {
        super(props);

        this.addProtocolSpecies = this.addProtocolSpecies.bind(this);
        this.removeProtocolSpecies = this.removeProtocolSpecies.bind(this);
    }

    addProtocolSpecies(species_name: string) {
        this.props.protocol.species.push(new SpeciesProtocolInfo(species_name));
        this.selectedSpecies.push(species_name);
        this.forceUpdate();
    }

    removeProtocolSpecies(e: MouseEvent<HTMLElement>) {
        let name = $(e.target).data().name;

        this.selectedSpecies.remove(name);

        this.props.protocol.species = this.props.protocol.species.filter((info) => {
            return info.species_classifier !== name;
        });
        this.forceUpdate();

        e.preventDefault();
    }

    render() {
        let speciesInfos: SpeciesProtocolInfo[] = this.props.protocol.species;

        let speciesTabs = speciesInfos.map((info: SpeciesProtocolInfo) => {
            return (
                <Tab key={info.species_classifier}>
                    {info.species_classifier}
                    <i style={{color: 'red'}} className="fa fa-remove" onClick={this.removeProtocolSpecies} {...{'data-name': info.species_classifier}} />
                </Tab>
            )
        });

        let speciesTabsContent = speciesInfos.map((info: SpeciesProtocolInfo) => {
            return (
                <TabPanel key={info.species_classifier}>
                    <ProtocolSpeciesTab info={info} />
                </TabPanel>
            )
        });

        return (
            <div>
                <div className="text-center">
                    <SpeciesSelector options={this.props.speciesOptions} handleButtonClick={this.addProtocolSpecies} selectedSpecies={this.selectedSpecies} />
                </div>

                {this.props.protocol.species.length > 0 && (
                    <Tabs>
                        <TabList>
                            {speciesTabs}
                        </TabList>

                        {speciesTabsContent}
                    </Tabs>
                )}
            </div>
        )
    }
}