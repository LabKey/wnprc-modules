import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { App } from '@labkey/api';

import {GridPanelConfig} from '../../components/GridPanelConfig';
import { gridConfig } from '../configProps';

App.registerApp<any>('research_ultrasounds_webpart', (target: string) => {
    ReactDOM.render(
        <GridPanelConfig
            {...gridConfig}
        />,
        document.getElementById(target)
    );
}, true /* hot */);
