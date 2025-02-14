import * as React from "react";

import { ContextProvider } from "./VirologyContextProvider";
import DropdownContainer from "./DropdownContainer";
import { App } from "@labkey/api";
import * as ReactDOM from "react-dom";
import { DropdownContainerProps } from '../typings/main';
import { createRoot } from 'react-dom/client';
App.registerApp<any>('DropdownSelect', (target: string, ctx: DropdownContainerProps) => {
    const container = document.getElementById(target);
    const root = createRoot(container); // createRoot(container!) if you use TypeScript
    root.render(<ContextProvider><DropdownContainer update={ctx.update} /></ContextProvider>);
});
