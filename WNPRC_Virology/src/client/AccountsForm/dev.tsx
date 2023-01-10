import React from 'react'
import ReactDOM from 'react-dom'
import { AppContainer } from 'react-hot-loader'
import { App } from "@labkey/api";
import { ContextProvider } from "./VirologyContextProvider";
import DropdownContainer from "./DropdownContainer";

const render = (target, ctx) => {
    ReactDOM.render(
            <AppContainer>
                    <ContextProvider><DropdownContainer update={ctx.update} /></ContextProvider>
                </AppContainer>,
            document.getElementById(target)
        );
};

App.registerApp<any>('DropdownSelect', render, true);

declare const module: any;

if (module.hot) {
    module.hot.accept();
}