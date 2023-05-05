import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { AppContainer } from 'react-hot-loader';

// Main react component
import { GridPanelConfig } from '../components/GridPanelConfig';

// Import stylesheets
import "../wnprc_ehr.scss";

const render = () => {
    ReactDOM.render(
        <AppContainer>
            <GridPanelConfig
                schemaName = {"study"}
                queryName = {"ResearchUltrasoundsInfo"}
                formType = {"Research Ultrasounds"}
                input = {"researchUltrasoundsEntry"}
                cellStyle={{
                    column: "reviewcompleted",
                    green: "Yes",
                    red: "No",
                }}
            />
        </AppContainer>,
        document.getElementById('app')
    )
};

declare const module: any;

if (module.hot) {
    module.hot.accept();
}

render();