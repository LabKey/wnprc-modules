/*
 *
 *  * Copyright (c) 2025-2026 Board of Regents of the University of Wisconsin System
 *  *
 *  * Licensed under the Apache License, Version 2.0 (the "License");
 *  * you may not use this file except in compliance with the License.
 *  * You may obtain a copy of the License at
 *  *
 *  *     http://www.apache.org/licenses/LICENSE-2.0
 *  *
 *  * Unless required by applicable law or agreed to in writing, software
 *  * distributed under the License is distributed on an "AS IS" BASIS,
 *  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  * See the License for the specific language governing permissions and
 *  * limitations under the License.
 *
 */

import * as React from 'react';
import { FC } from 'react';
import * as d3 from 'd3';
import { Room, RoomObject, RoomObjectTypes } from '../../types/typings';
import { parseRoomItemNum } from '../../utils/helpers';

interface GateSwitchProps {
    selectedObj: RoomObject;
    setLocalRoom: React.Dispatch<React.SetStateAction<Room>>;
    setReloadRoom: React.Dispatch<React.SetStateAction<Room>>;
    closeMenu: () => void;
}

export const GateSwitch: FC<GateSwitchProps> = (props) => {
    const {selectedObj, setLocalRoom, closeMenu, setReloadRoom} = props;

    // For each open or close, remove gate svg template of the opposite and replace with new version. Also switch id name version keeping id number
    const handleClick = () => {
        let newGateIdPrefix;
        if (selectedObj.type === RoomObjectTypes.GateOpen) {
            newGateIdPrefix = 'gateClosed';
        } else {
            newGateIdPrefix = 'gateOpen';
        }

        setLocalRoom(prevState => {
            const newRoom = {
                ...prevState,
                objects: prevState.objects.map((obj) => {
                    if (obj.itemId === selectedObj.itemId) {
                        return {
                            ...obj,
                            itemId: `${newGateIdPrefix}-${parseRoomItemNum((selectedObj as RoomObject).itemId)}`,
                            type: selectedObj.type === RoomObjectTypes.GateOpen ? RoomObjectTypes.GateClosed : RoomObjectTypes.GateOpen
                        };
                    }
                    return obj;
                })
            };
            setReloadRoom(newRoom);
            return newRoom;
        });

        closeMenu();
    };
    return (
        <div className={'menu-item'}>
            <button className={'menu-item-button'}
                    onClick={handleClick}>{selectedObj.type === RoomObjectTypes.GateOpen ? 'Close' : 'Open'}</button>
        </div>
    );
};