import * as React from "react";
import { ContextProvider } from "./ContextProvider";
import FeedingFormContainer from "./FeedingFormContainer";
import * as ReactDOM from 'react-dom';

window.addEventListener('DOMContentLoaded', (event) => {
    ReactDOM.render(
        <ContextProvider>
            <FeedingFormContainer />
        </ContextProvider>,
        document.getElementById('app')
    )
});