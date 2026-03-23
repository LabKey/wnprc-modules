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
import { FC } from 'react';
import { findCageInGroup } from '../../utils/LayoutEditorHelpers';
import { Cage } from '../../types/typings';
import { Button } from 'react-bootstrap';
import { useLayoutEditorContext } from '../../context/LayoutEditorContextManager';

interface RotateRackGroupProps {

}

export const RotateRackGroup: FC<RotateRackGroupProps> = (props) => {
    const {selectedObj, setLocalRoom, localRoom} = useLayoutEditorContext();
    const currRackGroup = findCageInGroup((selectedObj as Cage).svgId, localRoom.rackGroups).rackGroup;

    const rotateRack = () => {
        setLocalRoom(prevState => ({
            ...prevState,
            rackGroups: prevState.rackGroups.map(g => {
                if(g.groupId === currRackGroup.groupId) {
                    return {
                        ...g,
                        rotation: (g.rotation + 90) % 360
                    }
                }
                return g;
            })
        }))
    }

    return (
        <div className={'rotate-rack-group'}>
            <Button variant={'secondary'} onClick={rotateRack}>Rotate Rack</Button>
            <span>{localRoom.rackGroups.find(g => g.groupId === currRackGroup.groupId).rotation}</span>
        </div>
    );
};