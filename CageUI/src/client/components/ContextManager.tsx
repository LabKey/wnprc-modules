import * as React from 'react';
import { createContext, useContext, useState } from 'react';
import { Cage, Rack } from './typings';

export interface CageContextType {
    room: Rack[],
    setRoom: React.Dispatch<React.SetStateAction<Rack[]>>,
    clickedCage: Cage | null,
    setClickedCage: React.Dispatch<React.SetStateAction<Cage | null>> | null,
    clickedRack: Rack | null,
    setClickedRack: React.Dispatch<React.SetStateAction<Rack | null>> | null,
    isEditingRoom: boolean, // determines when the user is in edit mode
    setIsEditingRoom: React.Dispatch<React.SetStateAction<boolean>>,
    modRows: React.JSX.Element[],
    setModRows: React.Dispatch<React.SetStateAction<React.JSX.Element[]>>,
    cageDetails: Cage[] | null,
    setCageDetails: React.Dispatch<React.SetStateAction<Cage[] | null>> | null,
    saveMod: () => void,
    isDirty: boolean,
    setIsDirty: React.Dispatch<React.SetStateAction<boolean>>,
    isEditEnabled: boolean, // determines if the user has valid permissions to edit
    setIsEditEnabled: React.Dispatch<React.SetStateAction<boolean>>

}
const CageContext = createContext<CageContextType | null>(null);

export const useCurrentContext = () => {
    const context = useContext(CageContext);

    if (!context) {
        throw new Error(
            "useCurrentContext has to be used within <CurrentUserContext.Provider>"
        );
    }

    return context;
};

export const ContextProvider = ({children}) => {
    const [room, setRoom] = useState<Rack[]>([]);
    const [clickedCage, setClickedCage] = useState<Cage>();
    const [cageDetails, setCageDetails] = useState<Cage[]>([]);
    const [clickedRack, setClickedRack] = useState<Rack>();
    const [isEditingRoom, setIsEditingRoom] = useState<boolean>(false);
    const [isEditEnabled, setIsEditEnabled] = useState<boolean>(true);
    const [isDirty, setIsDirty] = useState<boolean>(false);
    const [modRows, setModRows] = useState<React.JSX.Element[]>([]);

    const saveMod = () => {
        setIsDirty(false);
        setRoom(prevRoom => {
            const updatedRoom = [...prevRoom];
            const clickedRackIndex = clickedRack.id - 1;
            if (updatedRoom[clickedRackIndex]) {
                // Create a deep copy of the cage state object
                updatedRoom[clickedRackIndex].cages.find(
                    (cage) => cage.id === clickedCage.id
                ).cageState = clickedCage.cageState;

                clickedRack.cages.forEach((cage) => {
                    updatedRoom[clickedRackIndex].cages.find(
                        (updateCage) => updateCage.id === cage.id
                    ).cageState = cage.cageState;
                })
            }
            return updatedRoom;
        });
    }

    return (
        <CageContext.Provider value={{
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
            saveMod,
            isDirty,
            setIsDirty,
            isEditEnabled,
            setIsEditEnabled
        }}>
            {children}
        </CageContext.Provider>
    )

}