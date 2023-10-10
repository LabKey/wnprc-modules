import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { AppContainer } from 'react-hot-loader';

import { ContextProvider } from "./ContextProvider";
import FeedingFormContainer from "./FeedingFormContainer";

const render = () => {
    ReactDOM.render(
        <AppContainer>
            <ContextProvider>
                <FeedingFormContainer />
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