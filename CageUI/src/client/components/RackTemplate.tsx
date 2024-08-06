import * as React from 'react';
import { FC } from 'react';
import { ActionURL } from '@labkey/api';
import { addNewRack } from './helpers';
import { Rack, RackTypes } from './typings';
import { ReactSVG } from 'react-svg';

interface RackTemplateProps {
    fileName: string,
    selectedEditRect: SVGRectElement,
    gridSize: number,
    localRoom: Rack[],
    room: Rack[],
    addRack: (newRack: Rack) => void,
    setAddingRack: (adding: boolean) => void,
    rackType: RackTypes,
    className?: string
}
export const RackTemplate: FC<RackTemplateProps> = (props) => {
    const {fileName, selectedEditRect, gridSize, localRoom, room, addRack, setAddingRack, rackType, className} = props;

    return (
        <div className={"rack-template"}>
            <svg className={className} width={"250"} height={"250"}>
                <ReactSVG
                    src={`${ActionURL.getContextPath()}/cageui/static/${fileName}.svg`}
                    id={'rack-template'}
                    wrapper={'svg'}
                    beforeInjection={(svg) => {
                        const tspan = svg.querySelectorAll("tspan")
                        tspan.forEach(node => {
                            node.style.pointerEvents = "none";
                        })
                        const editRect:SVGElement = svg.querySelector('#edit');
                        //editRect.style.pointerEvents = "bounding-box";
                        /*editRect.onclick = (e) => {
                            addNewRack(
                                selectedEditRect,
                                gridSize,
                                localRoom,
                                room,
                                addRack,
                                setAddingRack,
                                rackType
                            );
                        };*/
                    }}
                />
            </svg>
        </div>
    );
}