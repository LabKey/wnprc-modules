import * as React from 'react';
import * as ReactDOM from 'react-dom';

// Main react component
import  {GridPanelConfig}  from '../GridPanelConfig';
// Grid Panel Props
import { configProps } from './configProps';
// Import stylesheets
import '../../wnprc_ehr.scss';


const render = (): void => {
    const gridConfig: configProps = {queryName: '', schemaName: '', viewName: ''};

    ReactDOM.render(
        <GridPanelConfig
            {...gridConfig}
        />,
        document.getElementById('app')
    )
};

render();