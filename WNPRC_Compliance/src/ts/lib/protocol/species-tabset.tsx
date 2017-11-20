import * as React from "react";
import * as ko from "knockout";
import * as $ from "jquery";
import ChangeEvent = React.ChangeEvent;
import MouseEvent  = React.MouseEvent;
import {Protocol, SpeciesProtocolInfo} from "./protocol";
import * as toastr from "toastr";
import * as ReactTabs from 'react-tabs';
import TabList = ReactTabs.TabList;
import Tabs = ReactTabs.Tabs;
import TabPanel = ReactTabs.TabPanel;
import Tab = ReactTabs.Tab;
import {SpeciesSelector} from "./species-tabset/species-selector";
import {ProtocolSpeciesTab} from "./species-tabset/species-tab";
import {SpeciesClass, AllowedSpeciesForm, SpeciesForm} from "../../../../build/generated-ts/GeneratedFromJava";
import {addSpeciesToProtocol, deleteSpeciesFromProtocol, getAllowedSpecies} from "./protocol-api";
import * as _ from "underscore";
import * as rsvp from "rsvp";
import Promise = rsvp.Promise;
import * as s from "underscore.string";


export interface ProtocolSpeciesTabsetProps {
    protocol_revision: string
}

type ComponentState = 'loading' | 'edit' | 'view' | 'saving';

// IntelliJ sometimes has problems with this line, but Mapped Types were added 2.1, and
// allow this syntax.  Webpack doesn't complain about this...
type SpeciesMap = {[P in SpeciesClass]?: SpeciesForm};

interface ProtocolSpeciesTabsetState {
    state: ComponentState
    allowed_species: SpeciesMap
}

export class ProtocolSpeciesTabset extends React.Component<ProtocolSpeciesTabsetProps, ProtocolSpeciesTabsetState> {
    initialValue: Promise<AllowedSpeciesForm, any>;

    constructor(props: ProtocolSpeciesTabsetProps) {
        super(props);

        this.state = {
            state: 'loading',
            allowed_species: {}
        };

        this.addProtocolSpecies = this.addProtocolSpecies.bind(this);
        this.removeProtocolSpecies = this.removeProtocolSpecies.bind(this);

        this.initialValue = getAllowedSpecies(this.props.protocol_revision);
    }

    componentDidMount() {
        this.initialValue.then((form: AllowedSpeciesForm) => {
            let allowed_species = this.state.allowed_species;

            _.each(form.species, (info: SpeciesForm) => {
                allowed_species[info.speciesClass] = info;
            });

            this.setState({
                allowed_species: allowed_species
            });
        })
    }

    addProtocolSpecies(species: SpeciesClass) {
        this.setState({state: 'saving'}, () => {
            addSpeciesToProtocol(this.props.protocol_revision, species).then((info: SpeciesForm) => {
                let allowedSpecies = this.state.allowed_species || {};
                allowedSpecies[species] = info;

                this.setState({
                    allowed_species: allowedSpecies,
                    state: 'edit'
                });

                toastr.success(`Successfully added ${species} as an allowed species on this protocol revision`);
            }).catch(() => {
                toastr.error(`Failed to add ${species} as an allowed species on this protocol revision`)
            });
        });
    }

    removeProtocolSpecies(e: MouseEvent<HTMLElement>) {
        let name: SpeciesClass = $(e.target).data().name;

        if (window.confirm("This will delete this allowed species and all configuration regarding that species.  Are you sure you want to do this?")) {
            this.setState({state: 'saving'}, () => {
                deleteSpeciesFromProtocol(this.props.protocol_revision, name).then(() => {
                    let allowedSpecies = this.state.allowed_species || {};

                    // Remove this species from the map
                    delete allowedSpecies[name];

                    this.setState({
                        allowed_species: allowedSpecies,
                        state: 'edit'
                    });

                    toastr.success(`Successfully deleted ${name} as an allowed species for this protocol revision`);
                }).catch(() => {
                    toastr.error(`Failed to delete ${name} as an allowed species for this protocol revision`);
                });
            });
        }

        // Since this is called from an element inside the tab, we don't want to actually click on the tab.
        e.preventDefault();
    }

    render() {
        let selectedSpecies: SpeciesClass[] = _.keys(this.state.allowed_species || {}) as SpeciesClass[];

        let speciesTabs = selectedSpecies.map((name: SpeciesClass) => {
            let info = this.state.allowed_species[name];

            return (
                <Tab key={name}>
                    <span>
                        <span>{s.titleize(name.split('_').join(' '))}</span>
                        <i style={{color: 'red', marginLeft: '5px'}} className="fa fa-remove" onClick={this.removeProtocolSpecies} {...{'data-name': name}} />
                    </span>
                </Tab>
            )
        });

        let speciesTabsContent = selectedSpecies.map((name: SpeciesClass) => {
            let info = this.state.allowed_species[name];

            return (
                <TabPanel key={name}>
                    <div className="container-fluid">
                        <ProtocolSpeciesTab info={info || new SpeciesForm()} />
                    </div>
                </TabPanel>
            )
        });

        return (
            <div className="container-fluid">
                 <h3>
                     Allowed Species

                     <div style={{marginBottom: '10px'}} className="pull-right">
                         <SpeciesSelector alreadySelected={selectedSpecies} handleButtonClick={this.addProtocolSpecies} />
                     </div>
                 </h3>
                 <hr />


                {selectedSpecies.length > 0 && (
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