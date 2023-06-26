import React from 'react';
import * as ReactDOM from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import { App } from '@labkey/api';
import "../../../wnprc_ehr.scss";
import {GridPanelConfig} from '../../GridPanelConfig';
import { configProps } from '../configProps';
import { getURLParameters } from '../../../query/helpers';

App.registerApp<any>('grid_panel_webpart', (target: string, ctx: any) => {
    configProps.schemaName = ctx.schemaName;
    configProps.queryName = ctx.queryName;
    configProps.viewName = ctx.viewName;
    configProps.input.controller = ctx.inputController;
    configProps.input.view = ctx.inputView;
    configProps.input.formType = ctx.inputFormType;
    configProps.filterConfig.subjects = JSON.parse(ctx.subjects);
    configProps.filterConfig.date = ctx.date;
    configProps.filterConfig.filters = JSON.parse(ctx.filters);
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

