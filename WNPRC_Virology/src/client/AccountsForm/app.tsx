import * as React from "react";

import { ContextProvider } from "./VirologyContextProvider";
import DropdownContainer from "./DropdownContainer";
import { App } from "@labkey/api";
import * as ReactDOM from "react-dom";
App.registerApp<any>('DropdownSelect', (target, ctx) => {
    ReactDOM.render(<ContextProvider><DropdownContainer update={ctx.update} /></ContextProvider>, document.getElementById(target));
});
