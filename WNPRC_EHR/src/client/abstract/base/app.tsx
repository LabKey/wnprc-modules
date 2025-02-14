import * as React from "react";
import { ContextProvider } from "./ContextProvider";
import AbstractContainer from "./AbstractContainer";
import { App } from '@labkey/api';
import { createRoot } from 'react-dom/client';

//export this function to be called in a requiresScript callback
App.registerApp<any>('Abstract', (id, rand) => {
    const container = document.getElementById("abstract-section" + id + rand);
    const root = createRoot(container);
    root.render(
        <ContextProvider>
            <AbstractContainer id={id} />
        </ContextProvider>
    );
});
