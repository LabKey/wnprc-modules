import React from 'react';
import * as ReactDOM from 'react-dom';
import { App } from '@labkey/api';

import {ResearchUltrasounds} from '../research_ultrasounds';

App.registerApp<any>('breedingWebpart', target => {
    ReactDOM.render(<ResearchUltrasounds />, document.getElementById(target));
});
