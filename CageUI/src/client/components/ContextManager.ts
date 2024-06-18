import * as React from 'react';
import { createContext, useContext } from 'react';
import { Cage, Rack } from './typings';

export interface CageContextType {
    room: Rack[],
    setRoom: React.Dispatch<React.SetStateAction<Rack[]>>,
    clickedCage: Cage | null,
    setClickedCage: React.Dispatch<React.SetStateAction<Cage | null>> | null,
    clickedRack: Rack | null,
    setClickedRack: React.Dispatch<React.SetStateAction<Rack | null>> | null,
    isEditing: boolean,
    setIsEditing: React.Dispatch<React.SetStateAction<boolean>>,
    modRows: React.JSX.Element[],
    setModRows: React.Dispatch<React.SetStateAction<React.JSX.Element[]>>,
    cageDetails: Cage[] | null,
    setCageDetails: React.Dispatch<React.SetStateAction<Cage[] | null>> | null,
    saveMod: () => void,
    isDirty: boolean,
    setIsDirty: React.Dispatch<React.SetStateAction<boolean>>

}
export const CageContext = createContext<CageContextType | null>(null);

export const useCurrentContext = () => {
    const context = useContext(CageContext);

    if (!context) {
        throw new Error(
            "useCurrentContext has to be used within <CurrentUserContext.Provider>"
        );
    }

    return context;
};