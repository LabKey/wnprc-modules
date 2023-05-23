import React from 'react';
import * as ReactDOM from 'react-dom';
import { App } from '@labkey/api';

import {GridPanelConfig} from '../../components/GridPanelConfig';
import { configProps } from '../configProps';
App.registerApp<any>('breedingWebpart', target => {
    ReactDOM.render(
        <GridPanelConfig
            {...configProps}
        />,
        document.getElementById(target));
});
