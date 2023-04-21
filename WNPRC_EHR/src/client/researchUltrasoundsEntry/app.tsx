import * as React from 'react';
import * as ReactDom from 'react-dom';

// Main react component


// Import stylesheets
import '../wnprc_ehr.scss';
// Need to wait for container element to be available in labkey wrapper before render
window.addEventListener('DOMContentLoaded', (event) => {
    ReactDom.render(
        <h1>Hello App</h1>,
        document.getElementById('app')
    );
});