/*
 *
 *  * Copyright (c) 2025 Board of Regents of the University of Wisconsin System
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
import { useHomeContext } from '../../../context/HomeContextManager';
import { Cage, CurrCageMods, ModLocations, Rack, RackGroup } from '../../../types/typings';
import { findDirStr, getLocationDirection } from '../../../utils/homeHelpers';
import {findConnectedCages, findConnectedRacks} from '../../../utils/helpers';
import { findCageInGroup } from '../../../utils/LayoutEditorHelpers';
import {
    ConnectedCage,
    ConnectedCages,
    ConnectedModType,
    ConnectedRack,
    ConnectedRacks
} from '../../../types/homeTypes';
import { ModificationMultiSelect } from './ModificationMultiSelect';

interface CageModificationsProps {
    cage: Cage;
    rack: Rack;
    currCageMods: CurrCageMods;
    setCurrCageMods: React.Dispatch<React.SetStateAction<CurrCageMods>>;
}
export const CageModifications: FC<CageModificationsProps> = (props) => {
    const {cage, rack, currCageMods, setCurrCageMods} = props;
    const {roomMods, selectedRoom} = useHomeContext();
    const [rackGroup, setRackGroup] = useState<RackGroup>(null);
    const [connectedCages, setConnectedCages] = useState<ConnectedCages>(null);
    const [aloneCages, setAloneCages] = useState<Cage[]>(null);
    const [connectedRacks, setConnectedRacks] = useState<ConnectedRacks>(null);

    // Find possible connects
    useEffect(() => {
        const {rackGroup: currGroup , rack: currRack}= findCageInGroup(cage.cageNum, selectedRoom.rackGroups);
        const connectionsObj = findConnectedCages(currRack,cage);

        // connect prev cages
        Object.entries(connectionsObj).forEach(([direction,connections]) => {
            connections.forEach((connection) => {
                if(cage.mods[direction].length > 0 ){
                    cage.mods[direction].forEach((modKeysInLoc) => {
                        if(modKeysInLoc.subId === connection.currSubId){
                            connection.mods = modKeysInLoc.mods.map(key => ({label: roomMods[key].label, value: roomMods[key].value, id: key}));
                        }
                    })
                }
            })
        })

        setConnectedCages(connectionsObj);
        setRackGroup(currGroup);
    }, []);

    useEffect(() => {
        if(!rackGroup) return;

        const connectionsObj = findConnectedRacks(rackGroup, rack, cage);

        Object.entries(connectionsObj).forEach(([direction,connections]) => {
            connections.forEach(connection => {
                if(cage.mods[direction].length > 0 ){
                    cage.mods[direction].forEach((modKeysInLoc) => {
                        if(modKeysInLoc.subId === connection.currSubId){
                            connection.mods = modKeysInLoc.mods.map(key => ({label: roomMods[key].label, value: roomMods[key].value, id: key}));
                        }
                    })
                }
            })
        })

        let tempAloneCages: Cage[] = rackGroup.racks.flatMap(r => r.cages);
        // filter out cages that are in rack connections
        Object.entries(connectionsObj).forEach(([d, groups]) => {
            groups.forEach((group) => {
                tempAloneCages = tempAloneCages.filter(c => c.cageNum !== group.adjCage.cageNum);
                tempAloneCages = tempAloneCages.filter(c => c.cageNum !== group.currCage.cageNum);
            })
        });
        // filter out cages that are in cage connections
        Object.entries(connectedCages).forEach(([d, groups]) => {
            groups.forEach((group) => {
                tempAloneCages = tempAloneCages.filter(c => c.cageNum !== group.adjCage.cageNum);
                tempAloneCages = tempAloneCages.filter(c => c.cageNum !== group.currCage.cageNum);
            })
        });
        // filter out cages that are in the same rack group as a result from rack connections, but aren't in the current rack
        tempAloneCages = tempAloneCages.filter(c => rack.cages.some(tc => tc.cageNum === c.cageNum));
        setConnectedRacks(connectionsObj);
        setAloneCages(tempAloneCages)
    }, [rackGroup, rack, connectedCages]);


    const handleChange = (location: ModLocations, pairs: ConnectedRack | ConnectedCage | Cage, selectedItems: ConnectedModType[]) => {

        if((pairs as ConnectedRack).adjRack){
            const newPairs = pairs as ConnectedRack;
            // edit if pair already exists
            if(currCageMods.adjRacks[location].find(c => {
                return newPairs.currCage.cageNum === c.currCage.cageNum
                    && newPairs.currRack.itemId === c.currRack.itemId
            })){
                setCurrCageMods(prevState => ({
                    ...prevState,
                    adjRacks: {
                        ...prevState.adjRacks,
                        [location]: prevState.adjRacks[location].map((c) => {
                            if(c.currSubId === newPairs.currSubId){
                                return ({
                                    ...c,
                                    mods: selectedItems
                                })
                            }else{
                                return c;
                            }
                        })
                    }
                }))
            }else{
                setCurrCageMods(prevState => ({
                    ...prevState,
                    adjRacks: {
                        ...prevState.adjRacks,
                        [location]: [...prevState.adjRacks[location], { ...newPairs, mods: selectedItems } ]
                    }
                }))
            }
        }else if((pairs as ConnectedCage).adjCage){// changing adjacent cages
            const newPairs = pairs as ConnectedCage;

            // edit if pair already exists
            if(currCageMods.adjCages[location].find(c => {
                return newPairs.currCage.cageNum === c.currCage.cageNum
            })){
                setCurrCageMods(prevState => ({
                    ...prevState,
                    adjCages: {
                        ...prevState.adjCages,
                        [location]: prevState.adjCages[location].map((c) => {
                            if(c.adjCage.cageNum === newPairs.adjCage.cageNum && c.currCage.cageNum === newPairs.currCage.cageNum){
                                return ({
                                    ...c,
                                    mods: selectedItems
                                })
                            }else{
                                return c;
                            }
                        })
                    }
                }))
            }else{
                setCurrCageMods(prevState => ({
                    ...prevState,
                    adjCages: {
                        ...prevState.adjCages,
                        [location]: [...prevState.adjCages[location], {...newPairs, mods: selectedItems}]
                    }
                }))
            }
        }else{// changing current cage (direct mods)
            setCurrCageMods(prevState => ({
                ...prevState,
                currCage: selectedItems
            }))
        }

    }

    return (
        <div className={"mod-container"}>
            <div className={"mod-container-columns"}>
                <div className={"mod-container-column"}>
                    <div className={"mod-table-container"}>
                        <h2>Current Cage</h2>
                        <ul className={"mod-table"}>
                            <li className={"mod-table-row mod-table-header"}>
                                <div className={"mod-table-column"}>Direct Modifications</div>
                            </li>
                            <ModificationMultiSelect
                                handleChange={(selectedItems) =>  handleChange(ModLocations.Direct, cage, selectedItems)}
                                prevItems={cage.mods[ModLocations.Direct].flatMap(subMods => {
                                    return subMods.mods.map(key => ({label: roomMods[key].label, value: roomMods[key].value, id: key}))
                                })}
                            />
                        </ul>
                        <h2>Adjacent Cages</h2>
                        <ul className={"mod-table"}>
                            <li className={"mod-table-row mod-table-header"}>
                                <div className={"mod-table-column"}>Current Cage</div>
                                <div className={"mod-table-column"}>Direction</div>
                                <div className={"mod-table-column"}>Adjacent Cage</div>
                                <div className={"mod-table-column"}>Modifications</div>
                            </li>
                            {connectedCages && Object.entries(connectedCages).map(([direction, cages], idx) =>
                                cages.map(c => {
                                    const loc: ModLocations = parseInt(direction) as ModLocations;
                                    const directionStr = findDirStr(loc);
                                    return (
                                        <li className={"mod-table-row"} key={`adj-inside-row-${idx}`} >
                                            <div className={"mod-table-column"} key={`adj-inside-${c.currCage.cageNum}-${idx}`}>
                                                {c.currCage.cageNum}
                                            </div>
                                            <div className={"mod-table-column"} key={`adj-inside-dir-${idx}`}>
                                                {directionStr}
                                            </div>
                                            <div className={"mod-table-column"} key={`adj-inside-${c.adjCage.cageNum}-${idx}`}>
                                                {c.adjCage.cageNum}
                                            </div>
                                            <div className={"mod-table-column"} key={`adj-inside-mod-${idx}`}>
                                                <ModificationMultiSelect
                                                    handleChange={(selectedItems) =>  handleChange(loc, c, selectedItems)}
                                                    directionCategory={getLocationDirection(loc)}
                                                    prevItems={c.mods}
                                                />
                                            </div>
                                        </li>
                                    );
                                })
                            )}
                        </ul>

                        <h2>Adjacent Racks</h2>
                        <ul className={"mod-table"}>
                            <li className={"mod-table-row mod-table-header"}>
                                <div className={"mod-table-column"}>Current Rack</div>
                                <div className={"mod-table-column"}>Current Cage</div>
                                <div className={"mod-table-column"}>Direction</div>
                                <div className={"mod-table-column"}>Adjacent Rack</div>
                                <div className={"mod-table-column"}>Adjacent Cage</div>
                                <div className={"mod-table-column"}>Modifications</div>
                            </li>
                            {connectedRacks && Object.entries(connectedRacks).map(([direction, racks], idx) =>
                                racks.map((r) => {
                                    const loc: ModLocations = parseInt(direction) as ModLocations;
                                    const directionStr = findDirStr(loc);
                                    return (
                                        <li className={"mod-table-row"} key={`adj-outside-row-${r.currSubId}`} >
                                            <div className={"mod-table-column"} key={`adj-outside-currRack-${r.currRack.itemId} - ${idx}`}>
                                                {r.currRack.itemId}
                                            </div>
                                            <div className={"mod-table-column"} key={`adj-outside-currCage-${r.currCage.cageNum}-${idx}`}>
                                                {r.currCage.cageNum}
                                            </div>
                                            <div className={"mod-table-column"} key={`adj-outside-dir-${idx}`}>
                                                {directionStr}
                                            </div>
                                            <div className={"mod-table-column"} key={`adj-outside-adjRack-${r.adjRack.itemId} - ${idx}`}>
                                                {r.adjRack.itemId}
                                            </div>
                                            <div className={"mod-table-column"} key={`adj-outside-adjCage-${r.adjCage.cageNum} - ${idx}`}>
                                                {r.adjCage.cageNum}
                                            </div>
                                            <div className={"mod-table-column"} key={`adj-outside-mod-left-${idx}`}>
                                                <ModificationMultiSelect
                                                    handleChange={(selectedItems) =>  handleChange(loc, r, selectedItems)}
                                                    directionCategory={getLocationDirection(loc)}
                                                    prevItems={r.mods}
                                                />
                                            </div>

                                        </li>
                                    );
                                })
                            )}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}