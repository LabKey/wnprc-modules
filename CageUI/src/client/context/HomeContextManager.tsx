import * as React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import {
    CageModification, CageModifications, CageModType,
    CageNumber,
    CageWithMods,
    ModData,
    ModLocations, ModTypes,
    PrevRoom,
    Rack,
    RackGroup,
    Room
} from '../types/typings';
import { HomeContextType } from '../types/homeContextTypes';
import { LoadedRooms, ModificationSaveResult, SelectedPage } from '../types/homeTypes';
import { Filter } from '@labkey/api';
import {
    labkeyActionSelectDistinctWithPromise,
    labkeyActionSelectWithPromise,
    labkeySaveRows
} from '../api/labkeyActions';
import { findCageInGroup, findRackInGroup } from '../utils/LayoutEditorHelpers';
import { buildNewLocalRoom, extractNumbers, parseRoomItemNum } from '../utils/helpers';
import { LayoutSaveResult, SelectedObj } from '../types/layoutEditorTypes';
import { Command } from '@labkey/api/dist/labkey/query/Rows';
import { compareMods } from '../utils/homeHelpers';


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
    const [selectedCage, setSelectedCage] = useState<CageWithMods>(null);
    const [selectedContextObj, setSelectedContextObj] = useState<SelectedObj>(null);
    const [abortController, setAbortController] = useState(null);

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
        if(!selectedPage?.room) return;
        if(loadedRooms[selectedPage.room].loaded) {
            setSelectedRoom(loadedRooms[selectedPage.room].room);
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
            queryName: 'cage_modifications',
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
                const tempModData: ModData[] = [];
                if(modResult.rowCount > 0){
                    modResult.rows.forEach((row) => {
                        const newRow: ModData = {
                            cage: row.cage,
                            location: row.location,
                            locationId: row.locationid,
                            modification: row.modification,
                            rack: row.rack,
                            room: row.room,
                            rowid: row.rowid,
                            startDate: row.startDate,
                            endDate: row.endDate,
                        };
                        tempModData.push(newRow);
                    })
                }


                const prevRoom: PrevRoom = {
                    name: selectedPage.room,
                    cagingData: historyResult.rows,
                    layoutData: tempNewRoom.layoutData,
                    modData: modResult.rowCount > 0 ? tempModData : undefined,
                }
                buildNewLocalRoom(prevRoom).then((d) => {
                    if(d){
                        tempNewRoom = {
                            ...d,
                            layoutData: tempNewRoom.layoutData,
                        }
                        setLoadedRooms((prevRooms) => ({
                            ...prevRooms,
                            [tempNewRoom.name]: {loaded: true, room: tempNewRoom}
                        }))
                        console.log(tempNewRoom)
                        setSelectedRoom(tempNewRoom);
                    }
                })
            }else{
                setSelectedRoom(tempNewRoom);
            }
        }).catch((err) => {
            console.error(err);
        })
    }, [selectedPage.room]);

    useEffect(() => {
        if(!selectedPage?.rack) return;
        //TODO Fetch mods for rack here as well and then set the rack and rack mods
        const {rack: currRack, rackGroup: currGroup} = findRackInGroup(selectedPage.rack, selectedRoom.rackGroups);
        setSelectedRack(currRack);
        setSelectedRackGroup(currGroup);
    }, [selectedPage.rack]);

    useEffect(() => {
        if(!selectedPage?.cage) return;

        const {cage: currCage, rack: currRack, rackGroup: currGroup} = findCageInGroup(selectedPage.cage as CageNumber, selectedRoom.rackGroups);
        setSelectedRackGroup(currGroup)
        setSelectedRack(currRack)
        setSelectedCage(currCage)

    }, [selectedPage.cage]);





    const saveCageMods = async (currCage: CageWithMods, prevMods: ModData[]): Promise<ModificationSaveResult> => {
        const {rack: currRack} = findCageInGroup(currCage.cageNum, selectedRoom.rackGroups);
        console.log("Saving Mod Room: ", selectedRoom);
        console.log("Saving Mod Rack: ", currRack);
        console.log("Saving Mod Cage: ", currCage);
        console.log("Saving Prev Mods: ", prevMods);
        const commands: Command[] = [];
        const modsToSave: ModData[] = [];
        const modsToUpdate: ModData[] = [];
        const modChanges = compareMods(prevMods, {mods: currCage.mods});
        const newTimestamp = new Date();
        console.log("Test: ", modChanges);
        modChanges.forEach((change) => {
            const modLoc = parseInt(change.direction);
            // new mod data if adding or modifying
            const newModData: ModData = {
                cage: parseRoomItemNum(currCage.cageNum),
                endDate: null,
                location: modLoc,
                locationId: change.mod.id,
                modification: change.mod.mod as ModTypes,
                rack: currRack.rowid,
                room: selectedRoom.name,
                startDate: newTimestamp
            };
            if(change.type === 'added'){
                // Add new mod
                modsToSave.push(newModData);
            }else if(change.type === 'modified'){
                // Set old mod date end date and add new mod to modsToSave
                const modToEnd = prevMods.find((mod) => {
                    return mod.rack === currRack.rowid && mod.cage === parseRoomItemNum(currCage.cageNum) && mod.location === modLoc && mod.locationId === change.oldMod.id;
                })
                modsToUpdate.push({...modToEnd, endDate: newTimestamp});
                modsToSave.push(newModData);
            }else{
                // Set mod end date
                const modToEnd = prevMods.find((mod) => {
                    return mod.rack === currRack.rowid && mod.cage === parseRoomItemNum(currCage.cageNum) && mod.location === modLoc && mod.locationId === change.oldMod.id;
                })
                modsToUpdate.push({...modToEnd, endDate: newTimestamp});
            }
        })

        if(modsToUpdate.length > 0){
            commands.push({
                command: "update",
                schemaName: "cageui",
                queryName: "cage_modifications",
                rows: modsToUpdate
            });
        }

        if(modsToSave){
            commands.push({
                command: "insert",
                schemaName: "cageui",
                queryName: "cage_modifications",
                rows: modsToSave
            });
        }
        const result = await labkeySaveRows(commands);
        // Determine success or failure
        if(result.errorCount === 0){
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
            saveCageMods
        }}>
            {children}
        </HomeContext.Provider>
    );
};

