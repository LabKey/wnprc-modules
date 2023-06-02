import React from 'react';
import * as ReactDOM from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import { App } from '@labkey/api';
import "../../wnprc_ehr.scss";
import {GridPanelConfig} from '../../components/GridPanelConfig';
import { configProps } from '../configProps';
import { getURLParameters } from '../../query/helpers';

App.registerApp<any>('breeding_webpart', (target: string) => {
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

