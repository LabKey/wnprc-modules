import * as React from "react";
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
import {SpeciesSelector} from "./species-tabset/species-selector";
import {ProtocolSpeciesTab} from "./species-tabset/species-tab";


export interface ProtocolSpeciesTabsetProps {
    protocol: Protocol
}

type ComponentState = 'loading' | 'edit' | 'view' | 'saving';

interface ProtocolSpeciesTabsetState {
    state: ComponentState
}

export class ProtocolSpeciesTabset extends React.Component<ProtocolSpeciesTabsetProps, {}> {
    selectedSpecies: KnockoutObservableArray<string> = ko.observableArray([]);

    constructor(props: ProtocolSpeciesTabsetProps) {
        super(props);

        this.state = {
            state: 'loading'
        };

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

        this.props.protocol.species = this.props.protocol.species.filter((info: SpeciesProtocolInfo) => {
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
                    {/*<SpeciesSelector options={this.props.speciesOptions} handleButtonClick={this.addProtocolSpecies} selectedSpecies={this.selectedSpecies} />*/}
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