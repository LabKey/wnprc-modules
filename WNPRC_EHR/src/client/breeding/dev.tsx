import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { AppContainer } from 'react-hot-loader';

// Main react component
import  {GridPanelConfig}  from '../components/GridPanelConfig';

// Import stylesheets
import '../wnprc_ehr.scss';

const render = () => {
    ReactDOM.render(
        <AppContainer>
            <GridPanelConfig
                schemaName = {"study"}
                queryName = {"PregnancyInfo"}
                formType = {"Pregnancies"}
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