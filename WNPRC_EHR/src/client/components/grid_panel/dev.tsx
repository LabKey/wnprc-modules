import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { AppContainer } from 'react-hot-loader';

// Main react component
import  {GridPanelConfig}  from '../GridPanelConfig';
// Grid Panel Props
import { configProps } from './configProps';
// Import stylesheets
import '../../wnprc_ehr.scss';


const render = () => {
    const gridConfig: configProps = {queryName: '', schemaName: '', viewName: ''};

    ReactDOM.render(
        <AppContainer>
            <GridPanelConfig
                {...gridConfig}
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