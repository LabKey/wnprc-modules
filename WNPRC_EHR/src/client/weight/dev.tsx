// React
import * as React from 'react';
import * as ReactDOM from 'react-dom';

// Components
import EnterWeightFormContainer from "./containers/Forms/EnterWeightFormContainer";
import {ContextProvider} from "./containers/App/ContextProvider";

const render = (): void => {
    ReactDOM.render(
        <ContextProvider>
            <EnterWeightFormContainer />
        </ContextProvider>,
        document.getElementById('app')
    )
};

render();