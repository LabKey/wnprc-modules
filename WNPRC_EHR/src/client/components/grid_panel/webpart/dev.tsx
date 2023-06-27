import React from 'react';
import * as ReactDOM from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import { App } from '@labkey/api';
import "../../../wnprc_ehr.scss";
import {GridPanelConfig} from '../../GridPanelConfig';
import { gridConfig } from '../configProps';
App.registerApp<any>('grid_panel_webpart', (target: string, ctx: any) => {

    gridConfig.schemaName = ctx.schemaName;
    gridConfig.queryName = ctx.queryName;
    gridConfig.viewName = ctx.viewName;
    gridConfig.input.controller = ctx.inputController;
    gridConfig.input.view = ctx.inputView;
    gridConfig.input.formType = ctx.inputFormType;
    gridConfig.filterConfig.subjects = JSON.parse(ctx.subjects);
    gridConfig.filterConfig.date = ctx.date;
    gridConfig.filterConfig.filters = JSON.parse(ctx.filters);
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

