import React from 'react';
import * as ReactDOM from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import { App } from '@labkey/api';
import "../../../wnprc_ehr.scss";
import {GridPanelConfig} from '../../GridPanelConfig';
import { configProps } from '../configProps';
import { getURLParameters } from '../../../query/helpers';

App.registerApp<any>('grid_panel_webpart', (target: string, ctx: any) => {
    configProps.filterConfig = getURLParameters(window.location.href);
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

