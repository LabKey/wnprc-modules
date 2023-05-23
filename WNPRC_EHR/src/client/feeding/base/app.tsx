import * as React from "react";
import * as ReactDom from "react-dom";
import { ContextProvider } from "./ContextProvider";
import FeedingFormContainer from "./FeedingFormContainer";

window.addEventListener('DOMContentLoaded', (event) => {
    ReactDom.render(
        <ContextProvider>
            <FeedingFormContainer />
        </ContextProvider>,
        document.getElementById("app")
    );
});
