import React from 'react';
import * as ReactDOM from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import { App } from '@labkey/api';

import {Breeding} from '../breeding';

App.registerApp<any>('breedingWebpart', (target: string) => {
    ReactDOM.render(
        <AppContainer>
            <Breeding />
        </AppContainer>,
        document.getElementById(target)
    );
}, true /* hot */);

declare const module: any;

