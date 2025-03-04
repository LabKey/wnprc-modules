import * as React from 'react';
import { FC, useState } from 'react';
import * as d3 from 'd3';
import { Room, RoomObject, RoomObjectTypes } from '../../types/typings';
import { parseRoomItemNum } from '../../utils/helpers';

interface GateSwitchProps {
    layoutSvg: d3.Selection<SVGElement, {}, HTMLElement, any>;
    selectedObj: RoomObject;
    setLocalRoom: React.Dispatch<React.SetStateAction<Room>>;
    closeMenu: () => void;
}

export const GateSwitch: FC<GateSwitchProps> = (props) => {
    const {layoutSvg, selectedObj, setLocalRoom, closeMenu} = props;
    console.log("Gate: ", selectedObj);

    // For each open or close, remove gate svg template of the opposite and replace with new version. Also switch id name version keeping id number
    const handleClick = () => {
        const gateSvg = layoutSvg.select(`#${selectedObj.itemId}`);
        let newGateIdPrefix;
        if(selectedObj.type === RoomObjectTypes.GateOpen){
            console.log('Closing Gate', gateSvg.node());
            newGateIdPrefix = 'gateClosed';
        }else{
            console.log('Opening Gate', gateSvg.node());
            newGateIdPrefix = 'gateOpen';
        }

        const newGateSvg = (d3.select(`#${newGateIdPrefix}_template_wrapper`) as d3.Selection<SVGElement, {}, HTMLElement, any>).node().cloneNode(true) as SVGElement;
        gateSvg.selectChild().remove();
        gateSvg.append(() => newGateSvg);
        gateSvg.attr('id', `${newGateIdPrefix}-${parseRoomItemNum((selectedObj as RoomObject).itemId)}`);

        setLocalRoom(prevState => {
            return {
                ...prevState,
                objects: prevState.objects.map((obj) => {
                    if(obj.itemId === selectedObj.itemId){
                        return {
                            ...obj,
                            itemId: `${newGateIdPrefix}-${parseRoomItemNum((selectedObj as RoomObject).itemId)}`,
                            type: selectedObj.type === RoomObjectTypes.GateOpen ? RoomObjectTypes.GateClosed : RoomObjectTypes.GateOpen
                        }
                    }
                    return obj;
                })
            }
        })
        closeMenu();
    }
    return (
        <div className={"menu-item"}>
            <button className={"menu-item-button"} onClick={handleClick}>{selectedObj.type === RoomObjectTypes.GateOpen ? 'Close' : 'Open'}</button>
        </div>
    );
}