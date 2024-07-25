import * as React from 'react';
import * as ReactDOM from 'react-dom';

// Main react component
import  {GridPanelConfig}  from '../components/GridPanelConfig';
// Grid Panel Props
import { gridConfig } from './configProps';
// Import stylesheets
import '../wnprc_ehr.scss';


const render = (): void => {
    ReactDOM.render(
        <GridPanelConfig
            {...gridConfig}
        />,
        document.getElementById('app')
    )
};

render();