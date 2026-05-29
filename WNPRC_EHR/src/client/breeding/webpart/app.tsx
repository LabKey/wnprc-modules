/*
 * Copyright (c) 2023-2026 Board of Regents of the University of Wisconsin System
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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
