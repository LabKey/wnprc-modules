import * as React from 'react';
import { FC, useEffect, useRef } from 'react';
import '../../../cageui.scss';
import { addPrevRoomSvgs } from '../../../utils/helpers';
import * as d3 from 'd3';
import { Cage } from '../../../types/typings';
import { CELL_SIZE } from '../../../utils/constants';
import { useRoomContext } from '../../../context/RoomContextManager';
import { useHomeNavigationContext } from '../../../context/HomeNavigationContextManager';

interface CurrentCageLayoutProps {
    cage: Cage;
}

export const CurrentCageLayout: FC<CurrentCageLayoutProps> = (props) => {
    const {cage} = props;
    const {selectedRoom} = useHomeNavigationContext();

    const cageRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (!cageRef.current) {
            return;
        }
        const cageSvg: d3.Selection<SVGElement, {}, HTMLElement, any> = d3.select(cageRef.current);
        cageSvg.selectAll(':scope > g').each(function (d, i) {
            // 'this' refers to the current DOM element
            const element = d3.select(this) as d3.Selection<SVGGElement, {}, null, undefined>;
            element.remove();
        });
        addPrevRoomSvgs('view', cage, cageSvg, selectedRoom, selectedRoom.mods);
    }, [cage]);

    // adding 1 to the width/height helps make sure the lines don't get cut off in the image
    return (
        <div className={'cage-layout'}>
            <svg id={'cage-svg'}
                 ref={cageRef}
                 width={cage.size * CELL_SIZE + 1}
                 height={cage.size * CELL_SIZE + 1}
                 viewBox={`0 0 ${cage.size * CELL_SIZE + 1} ${cage.size * CELL_SIZE + 1}`}
            />
        </div>
    );
}