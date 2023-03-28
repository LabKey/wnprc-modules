import * as React from "react";

import { ContextProvider } from "./VirologyContextProvider";
import DropdownContainer from "./DropdownContainer";
import { App } from "@labkey/api";
import * as ReactDOM from "react-dom";
import { DropdownContainerProps } from '../typings/main';
App.registerApp<any>('DropdownSelect', (target: string, ctx: DropdownContainerProps) => {
    ReactDOM.render(<ContextProvider><DropdownContainer update={ctx.update} /></ContextProvider>, document.getElementById(target));
});
