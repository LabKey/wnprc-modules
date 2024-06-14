import * as React from 'react';
import { FC, useState } from 'react';
import { ActionURL } from '@labkey/api';
import { changeStyleProperty, getRackSeparators, parseSeparator } from './helpers';
import { ReactSVG } from 'react-svg';

export const RoomLegend: FC<any> = () => {
    const [showLegend, setShowLegend] = useState<boolean>(true);

    return (
        <div className={"room-legend"}>
            <button className={"legend-header-btn"} onClick={() => setShowLegend(!showLegend)}>
                <h2 className={'legend-header'}>Legend</h2>
            </button>
            {showLegend && (
                <ReactSVG
                    src={`${ActionURL.getContextPath()}/cageui/static/legend.svg`}
                    wrapper={"div"}
                    className={"legend-svg"}
                />
            )}
        </div>
    );
}