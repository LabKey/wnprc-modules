import * as React from 'react';

import { ContextProvider } from "./ContextProvider";
import FeedingFormContainer from "./FeedingFormContainer";
import { createRoot } from 'react-dom/client';

const render = (): void => {
    const container = document.getElementById('app');
    const root = createRoot(container);
    root.render(
        <ContextProvider>
            <FeedingFormContainer />
        </ContextProvider>
    )
};

render();