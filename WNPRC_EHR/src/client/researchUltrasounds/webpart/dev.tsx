import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import { App } from '@labkey/api';

import {GridPanelConfig} from '../../components/GridPanelConfig';
import { gridConfig } from '../configProps';

App.registerApp<any>('research_ultrasounds_webpart', (target: string) => {
    ReactDOM.render(
        <AppContainer>
            <GridPanelConfig
                {...gridConfig}
            />
        </AppContainer>,
        document.getElementById(target)
    );
}, true /* hot */);

declare const module: any;

