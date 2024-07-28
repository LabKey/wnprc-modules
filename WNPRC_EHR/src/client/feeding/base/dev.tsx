import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { ContextProvider } from "./ContextProvider";
import FeedingFormContainer from "./FeedingFormContainer";

const render = (): void => {
    ReactDOM.render(
        <ContextProvider>
            <FeedingFormContainer />
        </ContextProvider>,
        document.getElementById('app')
    )
};

render();