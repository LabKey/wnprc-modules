import React from 'react'
import ReactDOM from 'react-dom'
import { App } from "@labkey/api";
import { ContextProvider } from "./VirologyContextProvider";
import DropdownContainer from "./DropdownContainer";

const render = (target, ctx) => {
    ReactDOM.render(
        <ContextProvider><DropdownContainer update={ctx.update} /></ContextProvider>,
        document.getElementById(target)
    );
};

App.registerApp<any>('DropdownSelect', render, true);
