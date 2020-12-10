import * as React from 'react';
import * as ReactDom from 'react-dom';
import './theme/css/index.css';
import './theme/css/react-datepicker.css'
import './theme/css/bootstrap.min.css'
import './theme/css/tooltip.css'

import {AnimalRequestForm} from "./containers/Forms/AnimalRequestForm";

jQuery(() => {
    ReactDom.render(
           <AnimalRequestForm/>,
        document.getElementById('app')
    );
});
