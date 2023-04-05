import React from 'react';
import * as ReactDOM from 'react-dom';
import { App } from '@labkey/api';

import {GridPanelConfig} from '../../components/GridPanelConfig';

App.registerApp<any>('breedingWebpart', target => {
    ReactDOM.render(
        <GridPanelConfig
            schemaName = {"study"}
            queryName = {"PregnancyInfo"}
            formType = {"Pregnancies"}
        />,
        document.getElementById(target));
});
