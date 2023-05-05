import * as React from 'react';
import * as ReactDom from 'react-dom';

// Main react component
import { GridPanelConfig } from '../components/GridPanelConfig';

// Import stylesheets
import "../wnprc_ehr.scss";


// Need to wait for container element to be available in labkey wrapper before render
window.addEventListener('DOMContentLoaded', (event) => {
    ReactDom.render(
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
        />,
        document.getElementById('app')
    );
});