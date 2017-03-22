import {SpeciesProtocolInfo} from "../protocol";
import * as React from "react";

export interface ProtocolSpeciesTabProps {
    info: SpeciesProtocolInfo
}

export class ProtocolSpeciesTab extends React.Component<ProtocolSpeciesTabProps, {}> {
    render() {
        return (
            <div>
                <h1>This is a species tab for {this.props.info.species_classifier}.</h1>
            </div>
        )
    }
}