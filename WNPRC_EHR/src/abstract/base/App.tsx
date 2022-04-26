import * as React from "react";
import * as ReactDom from "react-dom";
import { ContextProvider } from "./ContextProvider";
import AbstractContainer from "./AbstractContainer";
import * as jQuery from 'jquery';

//export this function to be called in a requiresScript callback
export const renderAnimalAbstract = (id: string, rand: string) => {
  jQuery(() => {
    ReactDom.render(
      <ContextProvider>
        <AbstractContainer id={id} />
      </ContextProvider>,
      document.getElementById("abstract-section" + id + rand)
    );
  });
}
