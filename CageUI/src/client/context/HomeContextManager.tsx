import * as React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import {
    Cage,
    CageMapKey,
    CageModificationsType,
    CageNumber, CageSvgId,
    CurrCageMods,
    ModHistoryData,
    ModLocations,
    ModTypes,
    PrevRoom,
    Rack,
    RackGroup,
    Room,
    RoomMods
} from '../types/typings';
import { HomeContextType } from '../types/homeContextTypes';
import { LoadedRooms, ModificationSaveResult, SelectedPage } from '../types/homeTypes';
import { Filter } from '@labkey/api';
import { labkeyActionSelectWithPromise, labkeySaveRows } from '../api/labkeyActions';
import { findCageInGroup, findRackInGroup } from '../utils/LayoutEditorHelpers';
import { buildNewLocalRoom, parseRoomItemNum, getAdjLocation } from '../utils/helpers';
import { SelectedObj } from '../types/layoutEditorTypes';
import { Command } from '@labkey/api/dist/labkey/query/Rows';
import { compareMods  } from '../utils/homeHelpers';
import _ from 'lodash';

const HomeContext = createContext<HomeContextType>({} as HomeContextType);

export const useHomeContext = () => {
    const context = useContext(HomeContext);

    if (!context) {
        throw new Error(
            'useRoomContext has to be used within <HomeContext.Provider>'
        );
    }

    return context;
};

export const HomeContextProvider = ({children}) => {
    // New state management
    const [selectedPage, setSelectedPage] = useState<SelectedPage>({selected: "Home"});
    const [selectedRoom, setSelectedRoom] = useState<Room>(null);
    const [selectedRackGroup, setSelectedRackGroup] = useState<RackGroup>(null);
    const [selectedRack, setSelectedRack] = useState<Rack>(null);
    const [selectedCage, setSelectedCage] = useState<Cage>(null);

    const [roomMods, setRoomMods] = useState<RoomMods>({});
    const [prevRoomMods, setPrevRoomMods] = useState<RoomMods>({});

    const [selectedContextObj, setSelectedContextObj] = useState<SelectedObj>(null);
    const [abortController, setAbortController] = useState(null);
    const [roomRefresh, setRoomRefresh] = useState<boolean>(false);

    // map of loaded rooms, loaded means fetched from layout_history
    const [loadedRooms, setLoadedRooms] = useState<LoadedRooms>({});

    /*
    Context for room svg
     */
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        console.log("Page: ", selectedPage)
    }, [selectedPage]);

    useEffect(() => {
        const roomConfig = {
            schemaName: "ehr_lookups",
            queryName: "rooms",
            columns: ["layout_scale", "border_width", "border_height", "status", "room"]
        }
        labkeyActionSelectWithPromise(roomConfig).then((d) => {
            if(d.rowCount > 0){
                const tempRooms: LoadedRooms = {};
                for (let row of d.rows) {
                    tempRooms[row.room] = {
                        loaded: false,
                        room: {
                            name: row.room,
                            objects: [],
                            rackGroups: [],
                            layoutData: {
                                scale: row.layout_scale,
                                borderWidth: row.border_width,
                                borderHeight: row.border_height,
                                status: row.status,
                            }
                        }
                    }
                }
                setLoadedRooms(tempRooms);
            }else{
                console.log("No Rooms Found.")
            }
        }).catch(e => {
            console.log(e)
        });
    }, []);


    // Gets room data for selected room, has abort controller in case the user switches rooms before return
    useEffect(() => {
        const shouldRunEffect = (
            roomRefresh || // Manual refresh requested
            (selectedPage?.room !== null && selectedPage?.room !== undefined) // Valid dependency
        );
        if(!shouldRunEffect) return;
        if(loadedRooms[selectedPage.room].loaded) {
            setSelectedRoom(loadedRooms[selectedPage.room].room);
            setRoomMods(loadedRooms[selectedPage.room].room.mods);
            // Ensure they don't share the same reference (using lodash to clone)
            setPrevRoomMods(_.cloneDeep(loadedRooms[selectedPage.room].room.mods));
            return;
        }
        if (abortController) {
            abortController.abort();
        }

        const layoutHistoryConfig = {
            schemaName: 'cageui',
            queryName: 'layout_history',
            columns: ['object_type', 'rack_group', 'rack', 'cage', 'x_coord', 'y_coord', 'rowid', 'extra_context'],
            filterArray: [
                Filter.create('room', selectedPage.room, Filter.Types.EQUALS),
                Filter.create('end_date', null, Filter.Types.ISBLANK)
            ],
            sort: "-rack_group",
        }
        const modHistoryConfig = {
            schemaName: 'cageui',
            queryName: 'cage_modifications_history',
            columns: [],
            filterArray: [
                Filter.create('room', selectedPage.room, Filter.Types.EQUALS),
                Filter.create('endDate', null, Filter.Types.ISBLANK),
            ]
        }
        // Ensures request is canceled if user clicks on a new room before return
        const newAbortController = new AbortController();
        setAbortController(newAbortController);
        const modReturnPromise = labkeyActionSelectWithPromise(modHistoryConfig, newAbortController.signal);
        const layoutReturnPromise = labkeyActionSelectWithPromise(layoutHistoryConfig, newAbortController.signal);

        Promise.all([modReturnPromise, layoutReturnPromise]).then(([modResult, historyResult]) => {
            let tempNewRoom: Room = loadedRooms[selectedPage.room].room;
            if(historyResult.rowCount > 0) {
                const tempModData: ModHistoryData[] = [];
                if(modResult.rowCount > 0){
                    modResult.rows.forEach((row) => {
                        const newRow: ModHistoryData = {
                            location: row.location,
                            modId: row.modId,
                            parentModId: row.parentModId,
                            subId: row.subId,
                            cage: row.cage,
                            modification: row.modification,
                            rack: row.rack,
                            room: row.room,
                            rowid: row.rowid,
                            startDate: row.startDate,
                            endDate: row.endDate
                        };
                        tempModData.push(newRow);
                    });
                }

                const prevRoom: PrevRoom = {
                    name: selectedPage.room,
                    cagingData: historyResult.rows,
                    layoutData: tempNewRoom.layoutData,
                    modData: modResult.rowCount > 0 ? tempModData : undefined,
                }
                buildNewLocalRoom(prevRoom).then((d) => {
                    const newLocalRoom = d[0];
                    if(newLocalRoom){
                        tempNewRoom = {
                            ...newLocalRoom,
                            layoutData: tempNewRoom.layoutData,
                        }
                        setRoomMods(newLocalRoom.mods);
                        // Ensure they don't share the same reference (using lodash to clone)
                        setPrevRoomMods(_.cloneDeep(newLocalRoom.mods));
                        setLoadedRooms((prevRooms) => ({
                            ...prevRooms,
                            [tempNewRoom.name]: {loaded: true, room: tempNewRoom}
                        }))
                        setSelectedRoom(tempNewRoom);
                        if(roomRefresh){
                            setRoomRefresh(false);
                        }
                    }
                })
            }else{
                setSelectedRoom(tempNewRoom);
                if(roomRefresh){
                    setRoomRefresh(false);
                }
            }
        }).catch((err) => {
            console.error(err);
            if(roomRefresh){
                setRoomRefresh(false);
            }
        })
    }, [selectedPage.room, roomRefresh]);

    useEffect(() => {
        if(!selectedPage?.rack) return;
        //TODO Fetch mods for rack here as well and then set the rack and rack mods
        const {rack: currRack, rackGroup: currGroup} = findRackInGroup(selectedPage.rack, selectedRoom.rackGroups);
        setSelectedRack(currRack);
        setSelectedRackGroup(currGroup);
    }, [selectedPage.rack]);

    useEffect(() => {
        if(!selectedPage?.cage) return;

        const {cage: currCage, rack: currRack, rackGroup: currGroup} = findCageInGroup(selectedPage.cage, selectedRoom.rackGroups);
        setSelectedRackGroup(currGroup)
        setSelectedRack(currRack)
        setSelectedCage(currCage)
    }, [selectedPage.cage]);

    // Refactored saveCageMods: clearer helpers, less duplication, and includes the missing state updates
    const saveCageMods = (currCage: Cage, currCageMods: CurrCageMods): ModificationSaveResult => {

        const cageModsByCage: { [key in CageSvgId]: CageModificationsType } = {};
        const roomModsAccumulator: RoomMods = {};
        let newRoomMods: RoomMods = {};
        const usedModKeys: CageMapKey[] = [];

        // Helpers
        const emptyCageMods = (): CageModificationsType => ({
            [ModLocations.Top]: [],
            [ModLocations.Bottom]: [],
            [ModLocations.Left]: [],
            [ModLocations.Right]: [],
            [ModLocations.Direct]: []
        });

        const ensureCageEntry = (cageId: CageSvgId) => {
            if (!cageModsByCage[cageId]) {
                cageModsByCage[cageId] = emptyCageMods();
            }
            return cageModsByCage[cageId];
        };

        const addOrAppendSubsectionMod = (
            cageId: CageSvgId,
            location: ModLocations,
            subsectionId: number,
            modId: CageMapKey
        ) => {
            const cageEntry = ensureCageEntry(cageId);
            const subsections = cageEntry[location];

            const existing = subsections.find(s => s.subId === subsectionId);
            if (!existing) {
                cageEntry[location] = [...subsections, { subId: subsectionId, mods: [modId] }];
            } else {
                cageEntry[location] = subsections.map(s =>
                    s.subId === subsectionId ? { ...s, mods: [...s.mods, modId] } : s
                );
            }
        };

        const recordRoomMod = (id: CageMapKey, label: string, value: ModTypes) => {
            roomModsAccumulator[id] = { label, value };
            usedModKeys.push(id);
        };

        // 1) Current cage → Direct subsection 1
        currCageMods.currCage.forEach(mod => {
            recordRoomMod(mod.id, mod.label, mod.value);
            addOrAppendSubsectionMod(currCage.id, ModLocations.Direct, 1, mod.id);
        });

        // 2) Adjacent cages
        Object.entries(currCageMods.adjCages).forEach(([dirKey, allDirMods]) => {
            const dir = Number(dirKey) as ModLocations;

            allDirMods.forEach(modSubsection => {

                modSubsection.mods.forEach(mod => {
                    recordRoomMod(mod.id, mod.label, mod.value);

                    // Update current cage in given direction
                    addOrAppendSubsectionMod(modSubsection.currCage.id, dir, modSubsection.currSubId, mod.id);

                    // Update adjacent cage in opposite direction
                    const adjDir = getAdjLocation(dir);
                    addOrAppendSubsectionMod(modSubsection.adjCage.id, adjDir, modSubsection.adjSubId, mod.id);
                });
            });
        });

        // 3) Adjacent racks
        Object.entries(currCageMods.adjRacks).forEach(([dirKey, connectedRacks]) => {
            const dir = Number(dirKey) as ModLocations;

            connectedRacks.forEach(modSubsection => {

                // Ensure current cage entry exists (seed from existing cage mods if available and not already present)
                const currEntry = ensureCageEntry(modSubsection.currCage.id);
                const isEntryEmpty =
                    currEntry[ModLocations.Top].length === 0 &&
                    currEntry[ModLocations.Bottom].length === 0 &&
                    currEntry[ModLocations.Left].length === 0 &&
                    currEntry[ModLocations.Right].length === 0 &&
                    currEntry[ModLocations.Direct].length === 0;

                if (isEntryEmpty && modSubsection.currCage.mods) {
                    cageModsByCage[modSubsection.currCage.id] = {
                        [ModLocations.Top]: modSubsection.currCage.mods[ModLocations.Top] || [],
                        [ModLocations.Bottom]: modSubsection.currCage.mods[ModLocations.Bottom] || [],
                        [ModLocations.Left]: modSubsection.currCage.mods[ModLocations.Left] || [],
                        [ModLocations.Right]: modSubsection.currCage.mods[ModLocations.Right] || [],
                        [ModLocations.Direct]: modSubsection.currCage.mods[ModLocations.Direct] || []
                    };
                }

                modSubsection.mods.forEach(mod => {
                    console.log("Current Adj Rack: ", mod);
                    recordRoomMod(mod.id, mod.label, mod.value);

                    // Update current cage at dir
                    addOrAppendSubsectionMod(modSubsection.currCage.id, dir, modSubsection.currSubId, mod.id);

                    // If needed later, mirror to adj cage:
                    // const adjDir = getAdjLocation(dir);
                    // addOrAppendSubsectionMod(modSubsection.adjCage.cageNum, adjDir, subsectionId, mod.id);
                });
            });
        });

        // Build newRoomMods from accumulated room mods.
        // Keeping this synchronous as resetMod path is commented out.
        Object.keys(roomModsAccumulator).forEach((key) => {
            newRoomMods[key] = {
                label: roomModsAccumulator[key].label,
                value: roomModsAccumulator[key].value
            };

            /*
            if (usedModKeys.includes(key as CageMapKey)) {
                newRoomMods[key] = { label: roomModsAccumulator[key].label, value: roomModsAccumulator[key].value };
            } else {
                newRoomMods[key] = await resetMod(roomModsAccumulator[key].value);
            }
            */
        });

        console.log(newRoomMods, cageModsByCage);
        setRoomMods(newRoomMods);

        // Merge cage modifications back into selectedRoom.rackGroups
        setSelectedRoom(prevState => {
            let newRackGroups = prevState.rackGroups;

            Object.entries(cageModsByCage).forEach(([cageId, value]) => {
                const { rack, rackGroup } = findCageInGroup(cageId as CageSvgId, newRackGroups);
                // rack and rackGroup are used indirectly by the map below; not mutated directly
                newRackGroups = newRackGroups.map(g => ({
                    ...g,
                    racks: g.racks.map(r => ({
                        ...r,
                        cages: r.cages.map(c => {
                            if (c.id === cageId) {
                                return { ...c, mods: value };
                            } else {
                                return c;
                            }
                        })
                    }))
                }));
            });

            return {
                ...prevState,
                rackGroups: newRackGroups
            };
        });

        return { status: "Success" };
    };

    const submitCageMods = async (currCage: Cage, currCageMods: CurrCageMods): Promise<ModificationSaveResult> => {
        const {rack: currRack} = findCageInGroup(currCage.id, selectedRoom.rackGroups);
        const commands: Command[] = [];
        const modsToSave: ModHistoryData[] = [];
        const modsToUpdate: ModHistoryData[] = [];
        const modChanges = compareMods(prevRoomMods, currCageMods);
        console.log("Mod Changes: ", modChanges);
        const newTimestamp = new Date();
        modChanges.forEach((change) => {
            const modLoc = parseInt(change.direction);
            // new mod data if adding or modifying
            const newModData: ModHistoryData = {
                location: undefined,
                subId: 0,
                modId: '',
                parentModId: null,
                cage: parseRoomItemNum(currCage.cageNum),
                endDate: null,
                modification: change.mod as ModTypes,
                rack: currRack.rowid,
                room: selectedRoom.name,
                startDate: newTimestamp
            };
            if(change.type === 'added'){
                // Add new mod
                modsToSave.push(newModData);
            }else {
                // Set old mod date end date
                /*const modToEnd = prevRoomMods.find((mod) => {
                    // Finding the correct mod in the desired location that is currently active
                    // Uses rack (rowid), cage num, location, location id and endDate to determine correct mod.
                    return mod.rackRowId === currRack.rowid && mod.cage === parseRoomItemNum(currCage.cageNum) && mod.endDate === null;
                });
                modsToUpdate.push({...modToEnd, endDate: newTimestamp});
                if (change.type === 'modified') { // add new mod if modified
                    modsToSave.push(newModData);
                }*/
            }
        })

        if(modsToUpdate.length > 0){
            commands.push({
                command: "update",
                schemaName: "cageui",
                queryName: "cage_modifications_history",
                rows: modsToUpdate
            });
        }

        if(modsToSave){
            commands.push({
                command: "insert",
                schemaName: "cageui",
                queryName: "cage_modifications_history",
                rows: modsToSave
            });
        }
        console.log("Commands: ", commands);
        return;
        const result = await labkeySaveRows(commands);
        // Determine success or failure
        if(result.errorCount === 0){
            // On success refresh the current room and ensure that it fetches new data by changing loaded to false.
            setRoomRefresh(true);
            setLoadedRooms((prevRooms) => {
                if(prevRooms[selectedRoom.name]){
                    return {
                        ...prevRooms,
                       [selectedRoom.name]: {
                            ...prevRooms[selectedRoom.name],
                            loaded: false
                        }
                    }
                }else{
                    return prevRooms;
                }
            });
            return { status: 'Success'};
        }else{
            return {
                status: 'Failure',
                reason: ["failures"] // Return an array of failure reasons
            };
        }
    }

    return (
        <HomeContext.Provider value={{
            selectedPage,
            setSelectedPage,
            loading,
            error,
            selectedRoom,
            loadedRooms,
            setLoadedRooms,
            selectedRackGroup,
            selectedRack,
            selectedCage,
            selectedContextObj,
            setSelectedContextObj,
            saveCageMods,
            submitCageMods,
            roomMods,
            prevRoomMods,
            setPrevRoomMods
        }}>
            {children}
        </HomeContext.Provider>
    );
};

