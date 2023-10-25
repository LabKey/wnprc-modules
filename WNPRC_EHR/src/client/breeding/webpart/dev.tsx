import React from 'react';
import * as ReactDOM from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import { App } from '@labkey/api';
import "../../wnprc_ehr.scss";
import {GridPanelConfig} from '../../components/GridPanelConfig';
import { configProps } from '../../components/grid_panel/configProps';

App.registerApp<any>('breeding_webpart', (target: string, ctx: any) => {
    const gridConfig: configProps = {
        ...ctx,
        filterConfig: ctx.filterConfig ? JSON.parse(ctx.filterConfig) : undefined,
        columnStyles: ctx.columnStyles ? JSON.parse(ctx.columnStyles) : undefined,
    };
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

