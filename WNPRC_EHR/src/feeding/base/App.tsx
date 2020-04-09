// React
import * as React from 'react';
import * as ReactDom from 'react-dom';

// Components
import FeedingFormContainer from './FeedingFormContainer';
//import EnterWeightFormContainer from "./containers/Forms/EnterWeightFormContainer";
//import {ContextProvider} from "./containers/App/ContextProvider";
jQuery(() => {
    ReactDom.render(
        <FeedingFormContainer />,
        document.getElementById('app')
    );
});
