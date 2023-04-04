import React from 'react';
import * as ReactDOM from 'react-dom';
import { App } from '@labkey/api';

import {Breeding} from '../breeding';

App.registerApp<any>('breedingWebpart', target => {
    ReactDOM.render(<Breeding />, document.getElementById(target));
});
