import * as React from 'react';
import { FC, useEffect, useRef } from 'react';
import '../../../cageui.scss';
import { addPrevRoomSvgs } from '../../../utils/helpers';
import * as d3 from 'd3';
import { useRoomContext } from '../../../context/RoomContextManager';
import { useHomeNavigationContext } from '../../../context/HomeNavigationContextManager';

export const CurrentRackLayout: FC = () => {
    const {selectedRack, selectedRackGroup, selectedRoom} = useHomeNavigationContext();
    const rackRef = useRef<SVGSVGElement>(null);
    useEffect(() => {
        if (!selectedRack || !rackRef.current) {
            return;
        }
        const rackSvg: d3.Selection<SVGElement, {}, HTMLElement, any> = d3.select(rackRef.current);
        rackSvg.selectAll(':scope > g').each(function (d, i) {
            // 'this' refers to the current DOM element
            const element = d3.select(this) as d3.Selection<SVGGElement, {}, null, undefined>;
            if (element.node().id.includes('rack-svg')) {
                return;
            } else {
                element.remove();
            }
        });
        addPrevRoomSvgs('view', selectedRackGroup, rackSvg, undefined, selectedRoom.mods);
    }, [selectedRack]);

    return (
        <div className={'small-svg'}>
            <svg id={'rack-svg'}
                 ref={rackRef}
                 width={400}
                 height={400}
                 viewBox={`0 0 ${400} ${400}`}
            />

            Rack Details {selectedRack.itemId}
        </div>
    );
}