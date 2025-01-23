import * as React from 'react';

// Main react component
import  {GridPanelConfig}  from '../components/GridPanelConfig';
// Grid Panel Props
import {gridConfig} from './configProps';

// Import stylesheets
import '../wnprc_ehr.scss';
import { createRoot } from 'react-dom/client';
// Need to wait for container element to be available in labkey wrapper before render
window.addEventListener('DOMContentLoaded', (event) => {
    const container = document.getElementById('app');
    const root = createRoot(container);
    root.render(
        <GridPanelConfig
            {...gridConfig}
        />
    );
});