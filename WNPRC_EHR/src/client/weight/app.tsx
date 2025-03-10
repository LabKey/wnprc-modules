// React
import * as React from 'react';

// Components
import EnterWeightFormContainer from "./containers/Forms/EnterWeightFormContainer";
import {ContextProvider} from "./containers/App/ContextProvider";
import { createRoot } from 'react-dom/client';


window.addEventListener('DOMContentLoaded', (event) => {
    const container = document.getElementById('app');
    const root = createRoot(container);
    root.render(
        <ContextProvider>
            <EnterWeightFormContainer />
        </ContextProvider>,
    )
});