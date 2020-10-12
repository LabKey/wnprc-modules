
import * as React from 'react';
import * as ReactDom from 'react-dom';

import {AnimalRequestForm} from "./containers/Forms/AnimalRequestForm";

jQuery(() => {
    ReactDom.render(
           <AnimalRequestForm id={'r18051'}/>,
        document.getElementById('webpart_0')
    );
});
