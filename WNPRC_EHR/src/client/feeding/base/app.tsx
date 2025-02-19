import * as React from "react";
import { ContextProvider } from "./ContextProvider";
import FeedingFormContainer from "./FeedingFormContainer";
import { createRoot } from 'react-dom/client';

window.addEventListener('DOMContentLoaded', (event) => {
    const container = document.getElementById('app');
    const root = createRoot(container);
    root.render(
        <ContextProvider>
            <FeedingFormContainer />
        </ContextProvider>
    )
});