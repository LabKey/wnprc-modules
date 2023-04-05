import React from 'react';
import * as ReactDOM from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import { App } from '@labkey/api';

import { GridPanelConfig } from '../../components/GridPanelConfig';

App.registerApp<any>('researchUltrasoundsWebpart', (target: string) => {
    ReactDOM.render(
        <AppContainer>
            <GridPanelConfig
                schemaName = {"study"}
                queryName = {"ResearchUltrasoundsInfo"}
                formType = {"Research Ultrasounds"}
            />
        </AppContainer>,
        document.getElementById(target)
    );
}, true /* hot */);

declare const module: any;

