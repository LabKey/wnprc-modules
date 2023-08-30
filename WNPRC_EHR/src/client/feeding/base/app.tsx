import * as React from "react";
import { ContextProvider } from "./ContextProvider";
import FeedingFormContainer from "./FeedingFormContainer";
import { createRoot } from 'react-dom/client';

window.addEventListener('DOMContentLoaded', (event) => {
    createRoot(
        document.getElementById('app')
    ).render(
        <ContextProvider>
            <FeedingFormContainer />
        </ContextProvider>
    );
});