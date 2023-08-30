// React
import * as React from 'react';
import { createRoot } from 'react-dom/client';

// Components
import EnterWeightFormContainer from "./containers/Forms/EnterWeightFormContainer";
import {ContextProvider} from "./containers/App/ContextProvider";

window.addEventListener('DOMContentLoaded', (event) => {
    createRoot(
        document.getElementById('app')
    ).render(
        <ContextProvider>
            <EnterWeightFormContainer />
        </ContextProvider>
    );
});