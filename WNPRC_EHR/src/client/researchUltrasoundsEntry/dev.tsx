import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { AppContainer } from 'react-hot-loader';

//Context for Entry Page
import {ContextProvider} from './ContextProvider';
// Main react component
import {ResearchUltrasoundFormContainer} from './ResearchUltrasoundFormContainer';
// Import stylesheets
import '../wnprc_ehr.scss';

const render = () => {
    ReactDOM.render(
        <AppContainer>
            <ContextProvider>
                <ResearchUltrasoundFormContainer />
            </ContextProvider>
        </AppContainer>,
        document.getElementById('app')
    )
};

declare const module: any;

if (module.hot) {
    module.hot.accept();
}

render();