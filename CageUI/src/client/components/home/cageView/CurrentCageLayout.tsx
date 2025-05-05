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
        const cageSvg: d3.Selection<SVGElement, {}, HTMLElement, any> = d3.select(cageRef.current);
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
            <div className={"cage-mod-table"}>
                <div className={"mod-table-header"}>
                    Modifications
                </div>
                {Object.entries(cage.mods).map(([loc, mods]) => {
                    const modLoc = parseInt(loc) as ModLocations;
                    console.log("ModLoc: ", ModLocations[modLoc])
                    return (
                        <div key={`mod-${modLoc}`}>
                            {ModLocations[modLoc]}
                            {mods.map((mod, idx) => {
                                return (
                                    <div key={`mod-${modLoc}-${idx}`}>
                                        {mod.mod}
                                    </div>
                                );
                            })}
                        </div>
                    )
                })}
            </div>
        </div>
    );
}