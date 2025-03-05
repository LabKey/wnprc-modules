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

interface RoomLayoutProps {
    roomName: string;
    borderSize: LayoutData;
}

export const RoomLayout: FC<RoomLayoutProps> = (props) => {
    const SVG_WIDTH = 1290; // starting pixel width of the layout svg
    const SVG_HEIGHT = 810; // starting pixel height of the layout svg
    const SMALL_GRID_RATIO = 4; // number of cells for length/width of a small cage
    const LARGE_GRID_RATIO = 8; // number of cells for length/width of a large cage
    const CELL_SIZE = 30; // number of pixels of a cell for length/width
    const {roomName, borderSize} = props;
    // number of cells in grid width/height, based off scale
    const gridWidth = Math.ceil(SVG_WIDTH / borderSize.scale / CELL_SIZE);
    const gridHeight = Math.ceil(SVG_HEIGHT / borderSize.scale / CELL_SIZE);
    const borderRef = useRef(null);
    const {localRoom} = useHomeContext();


    useEffect(() => {
        console.log("GRID: ", gridWidth, gridHeight);
        console.log("Border: ", borderSize);
    }, []);

    useEffect(() => {
        if(!roomName) return;
        const layoutSvg = d3.select("#layout-svg") as d3.Selection<SVGElement, {}, HTMLElement, any>;
        addPrevRoomSvgs('view', localRoom, layoutSvg);
    }, [roomName]);

    return (
        <div className={'room-layout'}>
            Room Layout {roomName}
            <div id={"layout-grid"}>
                <svg // Ensure the width/height fit the grid, using (scaled cell size * number of cells in width/height)
                    width={borderSize.borderWidth}
                    height={borderSize.borderHeight}
                    viewBox={`0 0 ${(borderSize.scale * CELL_SIZE) * gridWidth} ${(borderSize.scale * CELL_SIZE) * gridHeight}`}
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
                            viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
                            height={SVG_HEIGHT}
                            width={SVG_WIDTH}
                            pointerEvents={'none'}
                        />
                    </g>
                </svg>
            </div>
        </div>
    );
}
