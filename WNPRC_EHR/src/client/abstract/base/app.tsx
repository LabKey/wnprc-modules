import * as React from "react";
import * as ReactDom from "react-dom";
import { ContextProvider } from "./ContextProvider";
import AbstractContainer from "./AbstractContainer";
import * as jQuery from 'jquery';
import { App } from '@labkey/api';

//export this function to be called in a requiresScript callback
App.registerApp<any>('Abstract', (id, rand) => {
    ReactDom.render(
        <ContextProvider>
            <AbstractContainer id={id} />
        </ContextProvider>,
        document.getElementById("abstract-section" + id + rand)
    );
});
