import React from 'react';
import * as ReactDOM from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import { App } from '@labkey/api';

import {GridPanelConfig} from '../../components/GridPanelConfig';
import { configProps } from '../configProps';

App.registerApp<any>('breedingWebpart', (target: string) => {
    ReactDOM.render(
        <AppContainer>
            <GridPanelConfig
                {...configProps}
            />
        </AppContainer>,
        document.getElementById(target)
    );
}, true /* hot */);

declare const module: any;

