/*
 *
 *  * Copyright (c) 2026 Board of Regents of the University of Wisconsin System
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
import { FC, useState } from 'react';
import { RoomObject, RoomObjectTypes } from '../../../types/typings';
import { parseRoomItemNum, roomItemToString } from '../../../utils/helpers';

interface GateEditorProps {
    roomObj: RoomObject;
    setRoomObj: React.Dispatch<React.SetStateAction<RoomObject>>;
}

export const GateEditor: FC<GateEditorProps> = (props) => {
    const {roomObj, setRoomObj} = props;
    const [attachedRoom, setAttachedRoom] = useState<string>(roomObj.extraContext.room);
    const [isGateOpen, setIsGateOpen] = useState<boolean>(roomObj.type === RoomObjectTypes.GateOpen);


    const handleGateStatus = () => {
        if(isGateOpen){
            setIsGateOpen(false);
            setRoomObj(prevState => ({
                ...prevState,
                itemId: `${roomItemToString(RoomObjectTypes.GateClosed)}-${parseRoomItemNum(prevState.itemId)}`,
                type: RoomObjectTypes.GateClosed,
            }))
        }else{
            setIsGateOpen(true);
            setRoomObj(prevState => ({
                ...prevState,
                itemId: `${roomItemToString(RoomObjectTypes.GateOpen)}-${parseRoomItemNum(prevState.itemId)}`,
                type: RoomObjectTypes.GateOpen,
            }))
        }
    }

    return(
        <div className={"gate-editor"}>
            <div className={"gate-editor-row"}>
                <div className={"gate-editor-row-label"}>Room:</div>
                <div className={"gate-editor-row-value"}>{attachedRoom}</div>
            </div>
            <div className={'gate-editor-row'}>
                <div className={'gate-editor-row-label'}>Status:</div>
                <button
                    className={"gate-editor-status-btn"}
                    onClick={handleGateStatus}
                    data-status={isGateOpen ? 'open' : 'closed'}
                >
                    {isGateOpen ? 'Open' : 'Closed'}
                </button>

            </div>
        </div>
    )
}