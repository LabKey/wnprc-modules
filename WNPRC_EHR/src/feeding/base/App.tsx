// React
import * as React from "react";
import * as ReactDom from "react-dom";
import { ContextProvider } from "./ContextProvider";

// Components
import FeedingFormContainer from "./FeedingFormContainer";
//import EnterWeightFormContainer from "./containers/Forms/EnterWeightFormContainer";
//import {ContextProvider} from "./containers/App/ContextProvider";
jQuery(() => {
  ReactDom.render(
    <ContextProvider>
      <FeedingFormContainer />
    </ContextProvider>,
    document.getElementById("app")
  );
});
