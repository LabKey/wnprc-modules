import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { App } from '@labkey/api';
import "../../../wnprc_ehr.scss";
import {GridPanelConfig} from '../../GridPanelConfig';
import { configProps } from '../configProps';
App.registerApp<any>('grid_panel_webpart', (target: string, ctx: any) => {
    const gridConfig: configProps = {
        ...ctx,
        input: ctx.input ? JSON.parse(ctx.input) : undefined,
        cellStyles: ctx.cellStyles ? JSON.parse(ctx.cellStyles) : undefined,
        filterConfig: ctx.filterConfig ? JSON.parse(ctx.filterConfig) : undefined,
        columnStyles: ctx.columnStyles ? JSON.parse(ctx.columnStyles) : undefined,
    };
    ReactDOM.render(
        <GridPanelConfig
            {...gridConfig}
        />,
        document.getElementById(target)
    );
}, true /* hot */);

