import * as React from 'react';
import * as ReactDom from 'react-dom';

// Main react component
import  {Breeding}  from './breeding';

// Import stylesheets
import '../wnprc_ehr.scss';
// Need to wait for container element to be available in labkey wrapper before render
window.addEventListener('DOMContentLoaded', (event) => {
    ReactDom.render(
        <Breeding />,
        document.getElementById('app')
    );
});