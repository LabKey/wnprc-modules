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
    setAddingRack: (adding: boolean) => void,
    rackType: RackTypes,
    className?: string
}
export const RackTemplate: FC<RackTemplateProps> = (props) => {
    const {fileName, selectedEditRect, gridSize, localRoom, room, setAddingRack, rackType, className} = props;


    return (
        <div className={"rack-template"}>
            <ReactSVG
                src={`${ActionURL.getContextPath()}/cageui/static/${fileName}.svg`}
                id={'rack-template'}
                wrapper={'svg'}
                className={className}
                width={"250"}
                height={"250"}
                beforeInjection={(svg) => {
                    // Select all <tspan> elements
                    const tspans = svg.querySelectorAll('tspan');

                    // Iterate through each <tspan> and make its parent <text> content editable
                    tspans.forEach(node => {
                        const textElement = node.parentElement;
                        node.style.pointerEvents = "none";

                    });
                }}
            />
        </div>
    );
}