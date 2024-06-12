import * as React from 'react';
import {FC} from 'react';
import { ActionURL } from '@labkey/api';
import { changeStyleProperty, getRackSeparators, parseSeparator } from './helpers';
import { ReactSVG } from 'react-svg';

export const RoomLegend: FC<any> = () => {
    return (
        <div className={"room-legend"}>
            <h1 className={"legend-header"}>Legend</h1>

            <ReactSVG
                src={`${ActionURL.getContextPath()}/cageui/static/legend.svg`}
                wrapper={"div"}
                className={"legend-svg"}
            />
        </div>
    );
}