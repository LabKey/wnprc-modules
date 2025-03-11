import * as React from 'react';
import * as d3 from 'd3';
import { FC, useEffect, useRef } from 'react';
import { SelectRowsOptions } from '@labkey/api/dist/labkey/query/SelectRows';
import { ActionURL, Filter } from '@labkey/api';
import { labkeyActionSelectWithPromise } from '../../api/labkeyActions';
import { ReactSVG } from 'react-svg';
import { LayoutData } from '../../types/typings';
import { useHomeContext } from '../../context/HomeContextManager';
import { addPrevRoomSvgs } from '../../utils/helpers';
import { updateBorderSize } from '../../utils/LayoutEditorHelpers';

interface RoomLayoutProps {
    roomName: string;
    borderSize: LayoutData;
}

export const RoomLayout: FC<RoomLayoutProps> = (props) => {
    const {localRoom} = useHomeContext();
    const borderRef = useRef(null);


    useEffect(() => {
        if(!localRoom.name) return;
        d3.select("#layout-svg").selectAll('*:not(#layout-border, #layout-border *)').remove();
        const layoutSvg = d3.select("#layout-svg") as d3.Selection<SVGElement, {}, HTMLElement, any>;
        addPrevRoomSvgs('view', localRoom, layoutSvg);
    }, [localRoom.name]);

    return (
        <div className={'room-layout'}>
            <div id={"layout-grid"}>
                <svg // svg here is the size of the border (objects outside of border ignored), add 1 to viewbox to prevent visual cutting by a pixel
                    width={localRoom.layoutData.borderWidth + 1}
                    height={localRoom.layoutData.borderHeight + 1}
                    viewBox={`0 0 ${localRoom.layoutData.borderWidth + 1} ${localRoom.layoutData.borderHeight + 1}`}
                    id="layout-svg"
                >
                    <g className={'draggable room-obj'}
                       id={'layout-border'}
                       pointerEvents={'none'}
                    >
                        <ReactSVG
                            src={`${ActionURL.getContextPath()}/cageui/static/RoomBorder.svg`}
                            id={`border_template_wrapper`}
                            wrapper={'svg'}
                            key={'border_template_key'}
                            ref={borderRef}
                            className={''}
                            viewBox={`0 0 ${localRoom.layoutData.borderWidth} ${localRoom.layoutData.borderHeight}`}
                            height={localRoom.layoutData.borderHeight}
                            width={localRoom.layoutData.borderWidth}
                            pointerEvents={'none'}
                            afterInjection={(svg) => {
                                const borderGroup = d3.select('#layout-border') as d3.Selection<SVGGElement, {}, HTMLElement, any>;
                                updateBorderSize(borderGroup, localRoom.layoutData.borderWidth, localRoom.layoutData.borderHeight)
                            }}
                        />
                    </g>
                </svg>
            </div>
        </div>
    );
}
