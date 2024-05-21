import * as React from 'react';
import { createContext, useContext } from 'react';
import { Cage, Rack } from './typings';

export interface CageContextType {
    room: Rack[],
    setRoom: React.Dispatch<React.SetStateAction<Rack[]>>,
    clickedCage: Cage | null,
    setClickedCage: React.Dispatch<React.SetStateAction<Cage | null>> | null,
    clickedCagePartner: Cage | null,
    setClickedCagePartner: React.Dispatch<React.SetStateAction<Cage | null>> | null,
    clickedRack: Rack | null,
    setClickedRack: React.Dispatch<React.SetStateAction<Rack | null>> | null,
    cageDetails: Cage[] | null,
    setCageDetails: React.Dispatch<React.SetStateAction<Cage[] | null>> | null,
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