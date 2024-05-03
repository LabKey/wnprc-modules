import * as React from 'react';
import {FC} from 'react';
import { Cage, Rack } from '../../components/typings';
import { ReactSVG } from 'react-svg';
import { ActionURL } from '@labkey/api';
interface LayoutProps {
    room: Rack[]
}

interface CageProps {
    cage: Cage;
}

const CageItem: FC<CageProps> = (props) => {
    const {cage} = props;
    return (
        <div className={'cage-container'}>
            <svg width={"100"} height={"100"}>
                <rect
                    width="100%"
                    height="100%"
                    style={{fill: 'rgb(0,0,0,0)', strokeWidth: 3, stroke: 'black'}}
                />
                <text
                    y={"50%"}
                    x={"37%"}
                >
                    {cage.name}
                </text>
            </svg>
        </div>
    );
}

interface RackProps {
    rack: Rack;
}
const RackItem: FC<RackProps> = (props) => {
    const {rack} = props;
    return (
        <div key={rack.id.toString()} className={'rack-container'}>
            {rack.cages.map((cage) => {
                return(
                    <CageItem
                        key={cage.id}
                        cage={cage}
                    />
                );
            })}
        </div>
    );
};

export const RoomLayout: FC<LayoutProps> = (props) => {
    const {room}= props;
    console.log(room);
    const handleClick = (event) => {
        const svgPoint = event.target.ownerSVGElement.createSVGPoint();
        svgPoint.x = event.clientX;
        svgPoint.y = event.clientY;

        const path = event.target;
        const pathBounds = path.getBoundingClientRect();
        const pathMatrix = path.getScreenCTM().inverse();
        const clickPoint = svgPoint.matrixTransform(pathMatrix);

        if (path.isPointInFill(clickPoint) || path.isPointInStroke(clickPoint)) {
            console.log(`Clicked inside ${path.id}!`);
            // Add your click event handling logic here
        }
    };

    return (
        <div className={'room-layout'}>
            <ReactSVG src={`${ActionURL.getContextPath()}/CageUI/static/AB140-167.svg"} />
        </div>
    );
}

/*
            <ReactSVG src={"./CageUI/resources/web/CageUI/static/AB140-167.svg"} />

{room.map((rack) => {
    return(
        <RackItem
            key={rack.id}
            rack={rack}
        />
    );
})}
 */

