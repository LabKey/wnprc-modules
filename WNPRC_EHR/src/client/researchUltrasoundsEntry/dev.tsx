import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { AppContainer } from 'react-hot-loader';

// Main react component
import { ResearchUltrasounds } from './ResearchUltrasounds';

// Import stylesheets
import '../wnprc_ehr.scss';


const render = () => {
    ReactDOM.render(
        <AppContainer>
            <ResearchUltrasounds />
        </AppContainer>,
        document.getElementById('app')
    )
};

declare const module: any;

if (module.hot) {
    module.hot.accept();
}

render();