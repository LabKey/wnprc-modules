// @ts-nocheck

import * as React from 'react';
import { FC, useEffect, useState } from 'react';
import '../../../cageui.scss';
import { findRackInGroup } from '../../../utils/LayoutEditorHelpers';
import { Cage, CurrCageMods, ModLocations, ModTypes, RackGroup } from '../../../types/typings';
import { getDirectionString, getLocationDirection } from '../../../utils/homeHelpers';
import { findConnectedCages, findConnectedRacks, getAdjLocation } from '../../../utils/helpers';
import { ModificationSelect } from './ModificationSelect';
import { Button } from 'react-bootstrap';
import { CurrentRackLayout } from './CurrentRackLayout';
import { useHomeNavigationContext } from '../../../context/HomeNavigationContextManager';
import { useRoomContext } from '../../../context/RoomContextManager';
import { ConnectedCages, ConnectedRacks } from '../../../types/homeTypes';
import { Option } from '@labkey/components';

//TODO fix this component. Needs to save modifications and handle their state for racks.
export const RackModifications: FC = () => {
    const {selectedPage} = useHomeNavigationContext();
    const {selectedRoom, selectedRack} = useRoomContext();
    const [rackGroup, setRackGroup] = useState<RackGroup>(null);
    const [connectedCages, setConnectedCages] = useState<ConnectedCages>(null);
    const [aloneCages, setAloneCages] = useState<Cage[]>(null);
    const [connectedRacks, setConnectedRacks] = useState<ConnectedRacks>(null);
    const [currRackMods, setCurrRackMods] = useState<{ [key in string]: CurrCageMods }>(null);

    useEffect(() => {
        console.log('Connected Cages', connectedCages);
        console.log('Connected Racks', connectedRacks);
    }, [connectedRacks, connectedCages]);
    useEffect(() => {
        console.log('Current Rack Mods', currRackMods);
    }, [currRackMods]);
    // Find possible connects
    useEffect(() => {
        if (!selectedRack) {
            return;
        }
        const currGroup = findRackInGroup(selectedRack.svgId, selectedRoom.rackGroups).rackGroup;
        const connections = findConnectedCages(selectedRack, currGroup.rotation, undefined);
        const newRackMods: { [p: string]: CurrCageMods } = {...currRackMods};
        console.log('Connections', connections);
        Object.entries(connections).forEach(([loc, connection]) => {
            if (parseInt(loc) === ModLocations.Direct) {
                return;
            }
            connection.forEach(c => {
                newRackMods[c.currCage.objectId] = {
                    adjCages: {
                        [loc]: {...c}
                    } as ConnectedCage,
                    currCage: c.currCage.mods[ModLocations.Direct].flatMap(m => m.modKeys)
                };
                newRackMods[c.adjCage.objectId] = {
                    adjCages: {
                        [getAdjLocation(loc)]: {
                            ...c
                        } as ConnectedCage
                    } as ConnectedCages,
                    currCage: c.adjCage.mods[ModLocations.Direct].flatMap(m => m.modKeys)
                };
            });
        });
        console.log('New Rack Mods', newRackMods);
        setCurrRackMods(newRackMods);
        setConnectedCages(connections);
        setRackGroup(currGroup);
    }, [selectedRack]);

    useEffect(() => {
        if (!rackGroup) {
            return;
        }
        const connectedRacks = findConnectedRacks(rackGroup, selectedRack);
        console.log('Connected Racks #1: ', connectedRacks);
        const newRackMods: { [p: string]: CurrCageMods } = {...currRackMods};
        Object.entries(connectedRacks).forEach(([loc, connection]) => {
            if (parseInt(loc) === ModLocations.Direct) {
                return;
            }
            connection.forEach(c => {
                newRackMods[c.currCage.objectId] = {
                    adjCages: {
                        [loc]: {...c}
                    } as ConnectedCage,
                    currCage: c.currCage.mods[ModLocations.Direct].flatMap(m => m.modKeys)
                };
                newRackMods[c.adjCage.objectId] = {
                    adjCages: {
                        [getAdjLocation(parseInt(loc))]: {
                            ...c,
                        } as ConnectedRack
                    } as ConnectedRacks,
                    currCage: c.adjCage.mods[ModLocations.Direct].flatMap(m => m.modKeys)
                };
            });
        });
        console.log('New Rack Mods', newRackMods);

        setCurrRackMods(newRackMods);
        setConnectedRacks(connectedRacks);
    }, [rackGroup]);

    const handleModSave = () => {
        console.log('Saving Mods');
    };

    const handleChangeMod = (location: ModLocations, cage: Cage, selectedMod: Option<ModTypes>) => {
        setCurrRackMods(prevState => {
            if (!prevState) {
                return prevState;
            }

            const newCageModsArray = {...prevState};

            // Find the cage mods that match this cage
            const cageModsIndex = newCageModsArray.findIndex(cageMods =>
                cageMods.adjCages[location] &&
                cageMods.adjCages[location].some(conn => conn.currCage.objectId === cage.objectId)
            );

            if (cageModsIndex !== -1) {
                const newCageMods = {...newCageModsArray[cageModsIndex]};

                // Handle adjacent cages
                if (newCageMods.adjCages[location]) {
                    const connections = newCageMods.adjCages[location];
                    const updatedConnections = connections.map(conn => {
                        if (conn.currCage.objectId === cage.objectId) {
                            // Update current mods
                            const updatedCurrMods = [selectedMod];

                            // Create corresponding adjacent mods
                            const updatedAdjMods = [selectedMod].map(m => ({
                                ...m,
                                parentModId: m.modId,
                                modId: Utils.generateUUID().toUpperCase()
                            }));

                            return {
                                ...conn,
                                currMods: updatedCurrMods,
                                adjMods: updatedAdjMods
                            };
                        }
                        return conn;
                    });

                    newCageMods.adjCages[location] = updatedConnections;
                } else {
                    // Handle direct cage mods
                    newCageMods.currCage = [selectedMod];
                }

                newCageModsArray[cageModsIndex] = newCageMods;
            }

            return newCageModsArray;
        });
    };

    const handleRemoveMod = (location: ModLocations, cage: Cage) => {
        setCurrRackMods(prevState => {
            if (!prevState) {
                return prevState;
            }

            const newCageModsArray = {...prevState};

            // Find the cage mods that match this cage
            const cageModsIndex = newCageModsArray.findIndex(cageMods =>
                cageMods.adjCages[location] &&
                cageMods.adjCages[location].some(conn => conn.currCage.objectId === cage.objectId)
            );

            if (cageModsIndex !== -1) {
                const newCageMods = {...newCageModsArray[cageModsIndex]};

                // Handle adjacent cages
                if (newCageMods.adjCages[location]) {
                    const connections = newCageMods.adjCages[location];
                    const updatedConnections = connections.map(conn => {
                        if (conn.currCage.objectId === cage.objectId) {
                            return {
                                ...conn,
                                currMods: [],
                                adjMods: []
                            };
                        }
                        return conn;
                    });

                    newCageMods.adjCages[location] = updatedConnections;
                } else {
                    // Handle direct cage mods
                    newCageMods.currCage = [];
                }

                newCageModsArray[cageModsIndex] = newCageMods;
            }

            return newCageModsArray;
        });
    };


    return (
        <div className={'mod-container'}>
            <div className={'mod-container-columns'}>
                <div className={'mod-container-column'}>
                    <div className={'mod-table-container'}>
                        <h2>Unconnected cages</h2>
                        <ul className={'mod-table'}>
                            <li className={'mod-table-row mod-table-header'}>
                                <div className={'mod-table-column'}>Cage</div>
                                <div className={'mod-table-column'}>Modification</div>
                            </li>
                            {aloneCages && aloneCages.map((cage, idx) => {
                                return (
                                    <li className={'mod-table-row'} key={`alone-row-${idx}`}>
                                        <div className={'mod-table-column'} key={`alone-${cage.cageNum}-${idx}`}>
                                            {cage.cageNum}
                                        </div>
                                        <div className={'mod-table-column'} key={`alone-mod-${idx}`}>
                                            <ModificationSelect
                                                removeMod={handleRemoveMod}
                                                changeMod={handleChangeMod}
                                            />
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>

                        <h2>Adjacent cages inside current rack</h2>
                        <ul className={'mod-table'}>
                            <li className={'mod-table-row mod-table-header'}>
                                <div className={'mod-table-column'}>Cage</div>
                                <div className={'mod-table-column'}>Modification</div>
                                <div className={'mod-table-column'}>Direction</div>
                                <div className={'mod-table-column'}>Cage</div>
                                <div className={'mod-table-column'}>Modification</div>
                            </li>
                            {connectedCages && Object.entries(connectedCages).map(([loc, locConnections], idx) => {
                                return locConnections.map((connection, connIdx) => {
                                    const {currCage, adjCage, currMods, adjMods} = connection;
                                    let modRows = [];

                                    currMods.forEach((currMod, i) => {
                                        const adjMod = adjMods.find(adj => {
                                            if (currMod.parentModId && adj.modId === currMod.parentModId) {
                                                return true;
                                            }
                                            if (currMod.modId && adj.parentModId === currMod.modId) {
                                                return true;
                                            }
                                            return false;
                                        });
                                        modRows.push(
                                            <li className={'mod-table-row'}
                                                key={`connection-${idx}-${connIdx}-mod-${i}`}>
                                                {/* Current Cage Column */}
                                                <div className={'mod-table-column'}>
                                                    {currCage.cageNum}
                                                </div>
                                                <div className={'mod-table-column'}>
                                                    <ModificationSelect
                                                        defaultValue={selectedRoom.mods[currMod.modId]}
                                                        directionCategory={getLocationDirection(loc as ModLocations)}
                                                        removeMod={handleRemoveMod}
                                                        changeMod={(option) => handleChangeMod(loc, currCage, option)}
                                                        cageNum={currCage.cageNum}
                                                        modIndex={i}
                                                        location={loc}
                                                    />
                                                </div>

                                                {/* Direction Column */}
                                                <div className={'mod-table-column'}>
                                                    {getDirectionString(loc as ModLocations)}
                                                </div>

                                                {/* Adjacent Cage Column */}
                                                <div className={'mod-table-column'}>
                                                    {adjCage.cageNum}
                                                </div>
                                                <div className={'mod-table-column'}>
                                                    <ModificationSelect
                                                        defaultValue={selectedRoom.mods[adjMod.modId]}
                                                        directionCategory={getLocationDirection(loc as ModLocations)}
                                                        removeMod={handleRemoveMod}
                                                        changeMod={handleChangeMod}
                                                        cageNum={adjCage.cageNum}
                                                        modIndex={i}
                                                        location={loc}
                                                    />
                                                </div>
                                            </li>
                                        );
                                    });

                                    return modRows;
                                });
                            })}
                        </ul>

                        <h2>
                            Adjacent cages outside current rack
                        </h2>
                        <ul className={'mod-table'}>
                            <li className={'mod-table-row mod-table-header'}>
                                <div className={'mod-table-column'}>Rack</div>
                                <div className={'mod-table-column'}>Cage</div>
                                <div className={'mod-table-column'}>Modification</div>
                                <div className={'mod-table-column'}>Direction</div>
                                <div className={'mod-table-column'}>Rack</div>
                                <div className={'mod-table-column'}>Cage</div>
                                <div className={'mod-table-column'}>Modification</div>
                            </li>
                            {connectedRacks && Object.entries(connectedRacks).map(([loc, rackConnections], idx) => {
                                return rackConnections.map((connection, connIdx) => {
                                    const {currRack, currCage, adjRack, adjCage, currMods, adjMods} = connection;
                                    console.log('currMod', currMods);
                                    // Create rows for each mod pairing
                                    const modRows = [];

                                    currMods?.forEach((currMod, i) => {
                                        // Find the corresponding adjacent mod based on modId or parentModId
                                        let adjMod = null;
                                        if (adjMods && currMod) {
                                            // Look for matching mod in adjacent cage based on parentModId or modId
                                            const matchingAdjMod = adjMods.find(adj => {
                                                if (currMod.parentModId && adj.modId === currMod.parentModId) {
                                                    return true;
                                                }
                                                if (currMod.modId && adj.parentModId === currMod.modId) {
                                                    return true;
                                                }
                                                return false;
                                            });
                                            adjMod = matchingAdjMod || null;
                                        }

                                        modRows.push(
                                            <li className={'mod-table-row'}
                                                key={`rack-connection-${idx}-${connIdx}-mod-${i}`}>
                                                {/* Current Rack and Cage */}
                                                <div className={'mod-table-column'}
                                                     key={`curr-rack-${currRack.itemId}-${idx}-${connIdx}-${i}`}>
                                                    {currRack.itemId}
                                                </div>
                                                <div className={'mod-table-column'}
                                                     key={`curr-cage-${currCage.cageNum}-${idx}-${connIdx}-${i}`}>
                                                    {currCage.cageNum}
                                                </div>
                                                <div className={'mod-table-column'}
                                                     key={`curr-mod-${idx}-${connIdx}-${i}`}>
                                                    <ModificationSelect
                                                        defaultValue={selectedRoom.mods[currMod.modId]}
                                                        directionCategory={getLocationDirection(loc as ModLocations)}
                                                        removeMod={handleRemoveMod}
                                                        changeMod={handleChangeMod}
                                                        cageNum={currCage.cageNum}
                                                        modIndex={i}
                                                        location={loc}
                                                    />
                                                </div>

                                                {/* Direction */}
                                                <div className={'mod-table-column'}
                                                     key={`direction-${idx}-${connIdx}-${i}`}>
                                                    {getDirectionString(loc as ModLocations)}
                                                </div>

                                                {/* Adjacent Rack and Cage */}
                                                <div className={'mod-table-column'}
                                                     key={`adj-rack-${adjRack.itemId}-${idx}-${connIdx}-${i}`}>
                                                    {adjRack.itemId}
                                                </div>
                                                <div className={'mod-table-column'}
                                                     key={`adj-cage-${adjCage.cageNum}-${idx}-${connIdx}-${i}`}>
                                                    {adjCage.cageNum}
                                                </div>
                                                <div className={'mod-table-column'}
                                                     key={`adj-mod-${idx}-${connIdx}-${i}`}>
                                                    <ModificationSelect
                                                        defaultValue={selectedRoom.mods[adjMod.modId]}
                                                        directionCategory={getLocationDirection(loc as ModLocations)}
                                                        removeMod={handleRemoveMod}
                                                        changeMod={handleChangeMod}
                                                        cageNum={adjCage.cageNum}
                                                        modIndex={i}
                                                        location={loc}
                                                    />
                                                </div>
                                            </li>
                                        );
                                    });

                                    return modRows;
                                });
                            })}

                        </ul>
                    </div>
                </div>
                <div className={'mod-container-column'}>
                </div>
            </div>

            <div className={'mod-container-row'}>
                <Button
                    as={'input'}
                    type={'button'}
                    value={"Save"}
                    disabled={false}
                    onClick={handleModSave}
                />
            </div>
        </div>
    );
}