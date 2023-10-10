import React from 'react';
import * as ReactDOM from 'react-dom';
import { App } from '@labkey/api';
import "../../wnprc_ehr.scss";
import {GridPanelConfig} from '../../components/GridPanelConfig';
import { gridConfig } from '../configProps';
App.registerApp<any>('breeding_webpart', target => {
    ReactDOM.render(
        <GridPanelConfig
            {...gridConfig}
        />,
        document.getElementById(target));
});
