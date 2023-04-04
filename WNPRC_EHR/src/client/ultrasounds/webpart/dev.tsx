import React from 'react';
import * as ReactDOM from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import { App } from '@labkey/api';

import {ResearchUltrasounds} from '../research_ultrasounds';

App.registerApp<any>('breedingWebpart', (target: string) => {
    ReactDOM.render(
        <AppContainer>
            <ResearchUltrasounds />
        </AppContainer>,
        document.getElementById(target)
    );
}, true /* hot */);

declare const module: any;

