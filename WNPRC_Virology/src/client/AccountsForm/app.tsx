import * as React from "react";
import * as ReactDom from "react-dom";
import * as jQuery from 'jquery';

import { ContextProvider } from "./VirologyContextProvider";
import DropdownContainer from "./DropdownContainer";
//export this function to be called in a requiresScript callback
export const renderDropdown = () => {
  jQuery(() => {
    ReactDom.render(
      <ContextProvider>
        <DropdownContainer></DropdownContainer>
      </ContextProvider>,
      document.getElementById("app")
    );
  });
}
