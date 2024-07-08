import * as React from 'react';
import { FC, useEffect, useState } from 'react';
import { ActionURL } from '@labkey/api';
import { changeStyleProperty, getRackSeparators, parseSeparator } from './helpers';
import { ReactSVG } from 'react-svg';

export const RoomLegend: FC<any> = () => {
    const [showLegend, setShowLegend] = useState<boolean>(true);

    const [legendStyle, setLegendStyle] = useState("room-legend-open");
    useEffect(() => {
        if(showLegend){
            setLegendStyle("room-legend-open");
        }else{
            setLegendStyle("room-legend-close");
        }
    }, [showLegend]);


    return (
        <div className={legendStyle}>
            <button className={"legend-header-btn"} onClick={() => setShowLegend(!showLegend)}>
                <h2 className={showLegend ? 'legend-header-open' : 'legend-header-close'}>Legend</h2>
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