import * as React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import {
    Cage,
    CageNumber,
    CageWithMods,
    ModData,
    ModLocations,
    PrevRoom,
    Rack,
    RackGroup,
    Room,
    RoomItem
} from '../types/typings';
import { findNextModId, removeCircularReferences } from '../utils/homeHelpers';
import { HomeContextType } from '../types/homeContextTypes';
import { ExpandedRooms, ListRack, ListRoom, LoadedRooms, UpdatedMods, SelectedPage } from '../types/homeTypes';
import { Filter } from '@labkey/api';
import { labkeyActionSelectDistinctWithPromise, labkeyActionSelectWithPromise } from '../api/labkeyActions';
import { buildNewLocalRoom, findCageInGroup, findRackInGroup } from '../utils/LayoutEditorHelpers';
import { selectDistinctRows } from '@labkey/components';
import { extractNumbers, parseRoomItemNum } from '../utils/helpers';
import { SelectedObj } from '../types/layoutEditorTypes';


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
                Filter.create('end_date', null, Filter.Types.ISBLANK),
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
                        const cageConfig = {
                            schemaName: 'ehr_lookups',
                            queryName: 'cage',
                            column: 'cage',
                            filterArray: [
                                Filter.create('rowid', row.cage, Filter.Types.EQUALS),
                            ]
                        }
                        labkeyActionSelectDistinctWithPromise(cageConfig, newAbortController.signal).then((cageResult) => {
                            if(cageResult.values.length === 1){
                                const newRow: ModData = {
                                    cage: extractNumbers(cageResult.values[0]),
                                    location: row.location,
                                    locationId: row.locationid,
                                    modification: row.modification,
                                    rack: row.rack,
                                    room: row.room,
                                    rowid: row.rowid
                                };
                                tempModData.push(newRow);
                            }
                        });
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

        console.log("Changing rack");

    }, [selectedPage.cage]);


    /*
    End SVG context

    const saveMod = () => {
        setIsDirty(false);
        setRoom(prevRoom => {
            const updatedRoom = [...prevRoom];
            const clickedRackIndex = updatedRoom.findIndex(((rack) => rack.itemId === clickedRack.itemId))
            if (clickedRackIndex) {
                // Create a deep copy of the cage state object
                (updatedRoom[clickedRackIndex] as Rack).cages.find(
                    (cage) => cage.id === clickedCage.id
                ).cageState = clickedCage.cageState;

                clickedRack.cages.forEach((cage) => {
                    (updatedRoom[clickedRackIndex] as Rack).cages.find(
                        (updateCage) => updateCage.id === cage.id
                    ).cageState = cage.cageState;
                })
            }
            return updatedRoom;
        });
    }*/

    const addNewMod = (cage: CageWithMods, location: ModLocations)  => {

        setSelectedRoom(prevState => ({
            ...prevState,
            rackGroups: prevState.rackGroups.map((group) => ({
                ...group,
                racks: group.racks.map((rack) => ({
                    ...rack,
                    cages: rack.cages.map((c) => {
                        if(c.cageNum === cage.cageNum){
                            const newCage = {
                                ...c,
                                mods: {
                                    ...c.mods,
                                    [location]: [...c.mods[location], {id: findNextModId(c.mods[location]), mod: 'newMod'}]
                                }
                            };
                            setSelectedContextObj(newCage)
                            return newCage;
                        }else{
                            return c;
                        }
                    })
                }))
            }))
        }))
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
            addNewMod
        }}>
            {children}
        </HomeContext.Provider>
    );
};

