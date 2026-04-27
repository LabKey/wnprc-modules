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
import { FC, useEffect, useState } from 'react';
import '../../../cageui.scss';
import { Cage, CurrCageMods, ModLocations, Rack, RoomMods } from '../../../types/typings';
import { CurrentCageLayout } from '../cageView/CurrentCageLayout';
import { CageModifications } from './CageModifications';
import { useHomeNavigationContext } from '../../../context/HomeNavigationContextManager';
import { buildUpdatedCageAndRoomMods } from '../../../utils/homeHelpers';

interface ModificationEditorProps {
    currCage: Cage;
    currRack: Rack;
    updateCageMods: (mods: CurrCageMods) => void;
}

/*
    Context menu for room item. Renders differently depending on assigned type and passed in components.

 */
export const ModificationEditor: FC<ModificationEditorProps> = (props) => {
    const {
        currCage,
        currRack,
        updateCageMods,
    } = props;
    const {selectedLocalRoom} = useHomeNavigationContext();

    const [localCage, setLocalCage] = useState<Cage>(currCage);
    const [cageRoomMods, setCageRoomMods] = useState<RoomMods>(selectedLocalRoom.mods);

    const [currCageMods, setCurrCageMods] = useState<CurrCageMods>({
        adjCages: {
            [ModLocations.Left]: [],
            [ModLocations.Right]: [],
            [ModLocations.Top]: [],
            [ModLocations.Bottom]: [],
            [ModLocations.Direct]: []
        }, currCage: []
    });

    useEffect(() => {
        if(currCageMods){
            updateCageMods(currCageMods);

            const {cageModsByCage, newRoomMods} = buildUpdatedCageAndRoomMods(selectedLocalRoom, currCage, currCageMods);

            setLocalCage((prevState) => ({
                ...prevState,
                mods: cageModsByCage[prevState.objectId]
            }));
            setCageRoomMods(newRoomMods);
        }
    }, [currCageMods]);

    return (
        (currCage) &&
        <div className="modification-editor">
            <div className="modification-editor-content">
                <CageModifications
                    cage={currCage}
                    rack={currRack}
                    currCageMods={currCageMods}
                    setCurrCageMods={setCurrCageMods}
                />
                <CurrentCageLayout
                    cage={localCage}
                    cageRoomMods={cageRoomMods}
                />
            </div>
        </div>
    );
};