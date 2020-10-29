import * as React from "react";
import * as ReactDom from "react-dom";
import { ContextProvider } from "./ContextProvider";
import AbstractContainer from "./AbstractContainer";

//export this function to be called in a requiresScript callback
export const renderAnimalAbstract = (id: string) => {
  jQuery(() => {
    ReactDom.render(
      <ContextProvider>
        <AbstractContainer id={id} />
      </ContextProvider>,
      document.getElementById("abstract-section" + id)
    );
  });
}
