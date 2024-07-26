import * as React from 'react';
import * as ReactDOM from 'react-dom';
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
        <GridPanelConfig
            {...gridConfig}
        />,
        document.getElementById(target));
});
