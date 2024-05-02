import * as React from 'react';
import {FC} from 'react';
import { Cage, Rack } from '../../components/typings';
import { ReactSVG } from 'react-svg';
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
            <svg
                id="svg1"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 1213.52 701.66"
                height={"700px"}
                width={"1000px"}
            >
                <defs>
                    <style>{`.cls-1{fill:none;stroke:#000;stroke-miterlimit:13.33;stroke-width:1.33px;}`}</style>
                </defs>
                <path id="path2" d="M1213.52,0H1.09V701.66H1213.52Zm-2,700.66H3.09V2H1211.52Z" onClick={handleClick}/>
                <path id="path6" fill={"transparent"} className="cls-1" d="M113.55,148.64h141.7" onClick={handleClick}/>
                <path id="path30" className="cls-1" d="M.4,270.7,138.63,374.89C130,379.81,87.39,436.35,3.47,426.24"
                      onClick={handleClick}/>
                <path id="path6-2" fill={"transparent"} data-name="path6" className="cls-1" d="M255.25,148.64H393" onClick={handleClick}/>
                <path id="path6-3" fill={"transparent"} data-name="path6" className="cls-1" d="M254.75,148.14V42" onClick={handleClick}/>
                <path id="path6-4" fill={"transparent"} data-name="path6" className="cls-1" d="M254.75,258.24V148.14" onClick={handleClick}/>
                <path id="path6-5" fill={"transparent"} data-name="path6" className="cls-1" d="M393.45,258.24V148.14" onClick={handleClick}/>
                <path id="path6-6" fill={"transparent"} data-name="path6" className="cls-1" d="M393.45,148.14V42" onClick={handleClick}/>
                <path id="path6-7" fill={"transparent"} data-name="path6" className="cls-1" d="M114.05,148.14V42" onClick={handleClick}/>
                <path id="path6-8" fill={"transparent"} data-name="path6" className="cls-1" d="M114.05,258.24V148.14" onClick={handleClick}/>
                <path id="path6-9" fill={"transparent"} data-name="path6" className="cls-1" d="M112.55,258.74h142.7" onClick={handleClick}/>
                <path id="path6-10" fill={"transparent"} data-name="path6" className="cls-1" d="M255.25,258.74H394" onClick={handleClick}/>
                <path id="path6-11" fill={"transparent"} data-name="path6" className="cls-1" d="M112.55,42.54h142.7" onClick={handleClick}/>
                <path id="path6-12" fill={"transparent"} data-name="path6" className="cls-1" d="M253.25,42.54H394" onClick={handleClick}/>
                <path id="path6-13" fill={"transparent"} data-name="path6" className="cls-1" d="M491.74,148.64h141.7" onClick={handleClick}/>
                <path id="path6-14" fill={"transparent"} data-name="path6" className="cls-1" d="M633.44,148.64H771.15"
                      onClick={handleClick}/>
                <path id="path6-15" data-name="path6" className="cls-1" d="M632.94,148.14V42" onClick={handleClick}/>
                <path id="path6-16" data-name="path6" className="cls-1" d="M632.94,258.24V148.14"
                      onClick={handleClick}/>
                <path id="path6-17" data-name="path6" className="cls-1" d="M771.65,258.24V148.14"
                      onClick={handleClick}/>
                <path id="path6-18" data-name="path6" className="cls-1" d="M771.65,148.14V42" onClick={handleClick}/>
                <path id="path6-19" data-name="path6" className="cls-1" d="M492.24,148.14V42" onClick={handleClick}/>
                <path id="path6-20" data-name="path6" className="cls-1" d="M492.24,258.24V148.14"
                      onClick={handleClick}/>
                <path id="path6-21" data-name="path6" className="cls-1" d="M490.74,258.74h142.7" onClick={handleClick}/>
                <path id="path6-22" data-name="path6" className="cls-1" d="M633.44,258.74H772.15"
                      onClick={handleClick}/>
                <path id="path6-23" data-name="path6" className="cls-1" d="M490.74,42.54h142.7" onClick={handleClick}/>
                <path id="path6-24" data-name="path6" className="cls-1" d="M631.45,42.54h140.7" onClick={handleClick}/>
                <path id="path6-25" data-name="path6" className="cls-1" d="M852,148.64h140.7" onClick={handleClick}/>
                <path id="path6-26" data-name="path6" className="cls-1" d="M992.68,148.64h137.7" onClick={handleClick}/>
                <path id="path6-27" data-name="path6" className="cls-1" d="M992.18,148.14V42" onClick={handleClick}/>
                <path id="path6-28" data-name="path6" className="cls-1" d="M992.18,258.24V148.14"
                      onClick={handleClick}/>
                <path id="path6-29" data-name="path6" className="cls-1" d="M1130.88,258.24V148.14"
                      onClick={handleClick}/>
                <path id="path6-30" data-name="path6" className="cls-1" d="M1130.88,148.14V42" onClick={handleClick}/>
                <path id="path6-31" data-name="path6" className="cls-1" d="M851.48,148.14V42" onClick={handleClick}/>
                <path id="path6-32" data-name="path6" className="cls-1" d="M851.48,258.24V148.14"
                      onClick={handleClick}/>
                <path id="path6-33" data-name="path6" className="cls-1" d="M850,258.74h142.7" onClick={handleClick}/>
                <path id="path6-34" data-name="path6" className="cls-1" d="M992.68,258.74h138.7" onClick={handleClick}/>
                <path id="path6-35" data-name="path6" className="cls-1" d="M850,42.54h142.7" onClick={handleClick}/>
                <path id="path6-36" data-name="path6" className="cls-1" d="M990.68,42.54h140.7" onClick={handleClick}/>
                <path id="path6-37" data-name="path6" className="cls-1" d="M853,534h141.7" onClick={handleClick}/>
                <path id="path6-38" data-name="path6" className="cls-1" d="M994.67,534h137.71" onClick={handleClick}/>
                <path id="path6-39" data-name="path6" className="cls-1" d="M994.17,533.5V427.4" onClick={handleClick}/>
                <path id="path6-40" data-name="path6" className="cls-1" d="M994.17,643.61V533.5" onClick={handleClick}/>
                <path id="path6-41" data-name="path6" className="cls-1" d="M1131.88,643.61V533.5"
                      onClick={handleClick}/>
                <path id="path6-42" data-name="path6" className="cls-1" d="M1131.88,533.5V427.4" onClick={handleClick}/>
                <path id="path6-43" data-name="path6" className="cls-1" d="M853.47,533.5V427.4" onClick={handleClick}/>
                <path id="path6-44" data-name="path6" className="cls-1" d="M853.47,643.61V533.5" onClick={handleClick}/>
                <path id="path6-45" data-name="path6" className="cls-1" d="M852,644.11H994.67" onClick={handleClick}/>
                <path id="path6-46" data-name="path6" className="cls-1" d="M994.67,644.11h138.71"
                      onClick={handleClick}/>
                <path id="path6-47" data-name="path6" className="cls-1" d="M852,427.9H994.67" onClick={handleClick}/>
                <path id="path6-48" data-name="path6" className="cls-1" d="M991.68,427.9h141.7" onClick={handleClick}/>
                <path id="path6-49" data-name="path6" className="cls-1" d="M493.74,534h140.7" onClick={handleClick}/>
                <path id="path6-50" data-name="path6" className="cls-1" d="M634.44,534h138.7" onClick={handleClick}/>
                <path id="path6-51" data-name="path6" className="cls-1" d="M634.94,533.5V427.4" onClick={handleClick}/>
                <path id="path6-52" data-name="path6" className="cls-1" d="M634.94,643.61V533.5" onClick={handleClick}/>
                <path id="path6-53" data-name="path6" className="cls-1" d="M772.65,643.61V533.5" onClick={handleClick}/>
                <path id="path6-54" data-name="path6" className="cls-1" d="M772.65,533.5V427.4" onClick={handleClick}/>
                <path id="path6-55" data-name="path6" className="cls-1" d="M494.24,533.5V427.4" onClick={handleClick}/>
                <path id="path6-56" data-name="path6" className="cls-1" d="M494.24,643.61V533.5" onClick={handleClick}/>
                <path id="path6-57" data-name="path6" className="cls-1" d="M492.74,644.11h142.7" onClick={handleClick}/>
                <path id="path6-58" data-name="path6" className="cls-1" d="M635.44,644.11h138.7" onClick={handleClick}/>
                <path id="path6-59" data-name="path6" className="cls-1" d="M492.74,427.9h142.7" onClick={handleClick}/>
                <path id="path6-60" data-name="path6" className="cls-1" d="M632.44,427.9h141.7" onClick={handleClick}/>
                <path id="path6-61" data-name="path6" className="cls-1" d="M115.54,534h140.7" onClick={handleClick}/>
                <path id="path6-62" data-name="path6" className="cls-1" d="M256.24,534H395" onClick={handleClick}/>
                <path id="path6-63" data-name="path6" className="cls-1" d="M256.74,533.5V427.4" onClick={handleClick}/>
                <path id="path6-64" data-name="path6" className="cls-1" d="M256.74,643.61V533.5" onClick={handleClick}/>
                <path id="path6-65" data-name="path6" className="cls-1" d="M394.45,643.61V533.5" onClick={handleClick}/>
                <path id="path6-66" data-name="path6" className="cls-1" d="M394.45,533.5V427.4" onClick={handleClick}/>
                <path id="path6-67" data-name="path6" className="cls-1" d="M115,533.5V427.4" onClick={handleClick}/>
                <path id="path6-68" data-name="path6" className="cls-1" d="M115,643.61V533.5" onClick={handleClick}/>
                <path id="path6-69" data-name="path6" className="cls-1" d="M114.54,644.11h141.7" onClick={handleClick}/>
                <path id="path6-70" data-name="path6" className="cls-1" d="M256.24,644.11H396" onClick={handleClick}/>
                <path id="path6-71" data-name="path6" className="cls-1" d="M114.54,427.9h141.7" onClick={handleClick}/>
                <path id="path6-72" data-name="path6" className="cls-1" d="M254.25,427.9H396" onClick={handleClick}/>
            </svg>
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

