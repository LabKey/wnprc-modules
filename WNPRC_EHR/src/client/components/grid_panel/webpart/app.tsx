import React from 'react';
import * as ReactDOM from 'react-dom';
import { App } from '@labkey/api';
import "../../../wnprc_ehr.scss";
import {GridPanelConfig} from '../../GridPanelConfig';
import { configProps } from '../configProps';
import {getURLParameters} from '../../../query/helpers';
App.registerApp<any>('grid_panel_webpart', (target, ctx) => {
    console.log("ctx: ", ctx);
    configProps.schemaName = ctx.schemaName;
    configProps.queryName = ctx.queryName;
    configProps.viewName = ctx.viewName;
    configProps.input.controller = ctx.inputController;
    configProps.input.view = ctx.inputView;
    configProps.input.formType = ctx.inputFormType;
    configProps.subjects = ctx.subjects;
    configProps.filterConfig = getURLParameters(window.location.href);
    ReactDOM.render(
        <GridPanelConfig
            {...configProps}
        />,
        document.getElementById(target));
});
