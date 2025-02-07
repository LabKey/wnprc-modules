import React from 'react'
import ReactDOM from 'react-dom'
import { App } from "@labkey/api";
import { ContextProvider } from "./VirologyContextProvider";
import DropdownContainer from "./DropdownContainer";
import { createRoot } from 'react-dom/client';

const render = (target, ctx) => {
    const container = document.getElementById(target);
    const root = createRoot(container); // createRoot(container!) if you use TypeScript
    root.render(<ContextProvider><DropdownContainer update={ctx.update} /></ContextProvider>);
};

App.registerApp<any>('DropdownSelect', render, true);
