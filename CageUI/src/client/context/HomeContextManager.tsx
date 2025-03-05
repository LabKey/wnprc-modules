import * as React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { Cage, PrevRoom, Rack, Room, RoomItem } from '../types/typings';
import { removeCircularReferences } from '../utils/homeHelpers';
import { HomeContextType } from '../types/homeContextTypes';
import {SelectedPage} from '../types/homeTypes';
import { Filter } from '@labkey/api';
import { labkeyActionSelectWithPromise } from '../api/labkeyActions';
import { buildNewLocalRoom } from '../utils/LayoutEditorHelpers';


const HomeContext = createContext<HomeContextType | null>(null);

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
    const [localRoom, setLocalRoom] = useState<Room>(null);
    const [abortController, setAbortController] = useState(null);

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


    // Gets room data for selected room, has abort controller in case the user switches rooms before return
    useEffect(() => {
        if(!selectedPage?.room) return;
        if (abortController) {
            abortController.abort();
        }

        const borderConfig = {
            schemaName: "ehr_lookups",
            queryName: "rooms",
            columns: ["status", 'layout_scale', 'border_width', 'border_height'],
            filterArray: [Filter.create('room', selectedPage.room, Filter.Types.EQUAL)]
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

        const layoutBorder = labkeyActionSelectWithPromise(borderConfig, newAbortController.signal);
        const roomLayout = labkeyActionSelectWithPromise(layoutHistoryConfig, newAbortController.signal);

        Promise.all([layoutBorder, roomLayout]).then(([borderResult, roomResult]) => {
            let tempNewRoom: Room = {
                name: selectedPage.room,
                rackGroups: [],
                objects: [],
                layoutData: null
            }

            if(borderResult.rowCount > 0) {
                tempNewRoom.layoutData = {
                    scale: borderResult.rows[0].layout_scale,
                        borderWidth: borderResult.rows[0].border_width,
                        borderHeight: borderResult.rows[0].border_height,
                        status: borderResult.rows[0].status,
                }
            }
            if(roomResult.rowCount > 0) {
                const prevRoom: PrevRoom = {
                    name: selectedPage.room,
                    cagingData: roomResult.rows,
                    layoutData: tempNewRoom.layoutData,
                }
                buildNewLocalRoom(prevRoom).then((d) => {
                    if(d){
                        tempNewRoom = {
                            ...d,
                            layoutData: tempNewRoom.layoutData,
                        }
                        setLocalRoom(tempNewRoom);
                    }
                })
            }else{
                setLocalRoom(tempNewRoom);
            }

        }).catch((err) => {
            console.error(err);
        })
    }, [selectedPage.room])


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
            localRoom,
            loading,
            error,
            hasUnsavedChanges: JSON.stringify(removeCircularReferences(room)) !== JSON.stringify(removeCircularReferences(localRoom)),
            isDraggingEnabled,
            setIsDraggingEnabled,
            selectedPage,
            setSelectedPage,
            cageCount
        }}>
            {children}
        </HomeContext.Provider>
    );
};

