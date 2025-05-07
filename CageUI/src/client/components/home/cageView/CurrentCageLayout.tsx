import * as React from 'react';
import { FC, useEffect, useRef, useState } from 'react';
import '../../../cageui.scss';
import { useHomeContext } from '../../../context/HomeContextManager';
import { addPrevRoomSvgs } from '../../../utils/helpers';
import * as d3 from 'd3';
import { Cage, CageWithMods, DefaultRackTypes, ModLocations, RackTypes, RoomItemType } from '../../../types/typings';
import { CELL_SIZE } from '../../../utils/constants';

interface CurrentCageLayoutProps {
    cage: CageWithMods;
}

export const CurrentCageLayout: FC<CurrentCageLayoutProps> = (props) => {
    const {cage} = props;

    const cageRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if(!cageRef.current) return;
        console.log("Load Cage: ", cage)
        const cageSvg: d3.Selection<SVGElement, {}, HTMLElement, any> = d3.select(cageRef.current);
        cageSvg.selectAll(':scope > g').each(function(d, i) {
            // 'this' refers to the current DOM element
            const element = d3.select(this) as  d3.Selection<SVGGElement, {}, null, undefined>;
            element.remove();
        });
        addPrevRoomSvgs('view', cage, cageSvg);
    }, [cage]);

    return (
        <div className={'cage-layout'}>
            <svg id={'cage-svg'}
                 ref={cageRef}
                 width={cage.size * CELL_SIZE}
                 height={cage.size * CELL_SIZE}
                 viewBox={`0 0 ${cage.size * CELL_SIZE} ${cage.size * CELL_SIZE}`}
            />
        </div>
    );
}