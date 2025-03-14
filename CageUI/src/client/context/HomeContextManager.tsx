import * as React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { Cage, PrevRoom, Rack, Room, RoomItem } from '../types/typings';
import { removeCircularReferences } from '../utils/homeHelpers';
import { HomeContextType } from '../types/homeContextTypes';
import { ExpandedRooms, ListRack, ListRoom, LoadedRooms, SelectedPage } from '../types/homeTypes';
import { Filter } from '@labkey/api';
import { labkeyActionSelectWithPromise } from '../api/labkeyActions';
import { buildNewLocalRoom, findRackInGroup } from '../utils/LayoutEditorHelpers';
import { selectDistinctRows } from '@labkey/components';


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
    const [selectedRack, setSelectedRack] = useState<Rack>(null);
    const [abortController, setAbortController] = useState(null);

    // map of loaded rooms, loaded means fetched from layout_history
    const [loadedRooms, setLoadedRooms] = useState<LoadedRooms>({});



    // End new state management

    const [room, setRoom] = useState<RoomItem[]>([]);
    const [clickedCage, setClickedCage] = useState<Cage>();
    const [cageDetails, setCageDetails] = useState<Cage[]>([]);
    const [clickedRack, setClickedRack] = useState<Rack>();
    const [isEditingRoom, setIsEditingRoom] = useState<boolean>(false);
    const [isEditEnabled, setIsEditEnabled] = useState<boolean>(true);
    const [isDirty, setIsDirty] = useState<boolean>(false);
    const [modRows, setModRows] = useState<React.JSX.Element[]>([]);
    const [isDraggingEnabled, setIsDraggingEnabled] = useState<boolean>(false);
    const [cageCount, setCageCount] = useState<number>(0);

    /*
    Context for room svg
     */
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

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

        // Ensures request is canceled if user clicks on a new room before return
        const newAbortController = new AbortController();
        setAbortController(newAbortController);

        labkeyActionSelectWithPromise(layoutHistoryConfig, newAbortController.signal).then((d) => {
            let tempNewRoom: Room = loadedRooms[selectedPage.room].room;
            if(d.rowCount > 0) {
                const prevRoom: PrevRoom = {
                    name: selectedPage.room,
                    cagingData: d.rows,
                    layoutData: tempNewRoom.layoutData,
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

        selectedRoom.rackGroups.forEach((group) => {
            group.racks.forEach(rack => {
                if(rack.type.isDefault){
                    if(rack.extraContext.rackId.toString() === selectedPage.rack){
                        setSelectedRack(rack);
                    }
                }else{
                    if(rack.itemId === selectedPage.rack){
                        setSelectedRack(rack)
                    }
                }
            })
        })

        console.log("Changing rack");

    }, [selectedPage.rack]);


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

    return (
        <HomeContext.Provider value={{
            room,
            setRoom,
            clickedCage,
            setClickedCage,
            clickedRack,
            setClickedRack,
            isEditingRoom,
            setIsEditingRoom,
            modRows,
            setModRows,
            cageDetails,
            setCageDetails,
            isDirty,
            setIsDirty,
            isEditEnabled,
            setIsEditEnabled,
            loading,
            error,
            isDraggingEnabled,
            setIsDraggingEnabled,
            selectedPage,
            setSelectedPage,
            cageCount,
            selectedRoom,
            loadedRooms,
            setLoadedRooms,
            selectedRack,
            setSelectedRack
        }}>
            {children}
        </HomeContext.Provider>
    );
};

