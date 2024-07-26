// React
import * as React from 'react';
import * as ReactDOM from 'react-dom';

// Components
import EnterWeightFormContainer from "./containers/Forms/EnterWeightFormContainer";
import {ContextProvider} from "./containers/App/ContextProvider";


window.addEventListener('DOMContentLoaded', (event) => {
    ReactDOM.render(
        <ContextProvider>
            <EnterWeightFormContainer />
        </ContextProvider>,
        document.getElementById('app')
    )
});