import * as React from 'react';
import { FC, useState, useEffect } from 'react';
import { Cage, Rack } from './typings';
import { findDetails, loadRoom } from './helpers';
import { RoomLayout } from './RoomLayout';
import { CageContext } from './ContextManager';

interface DisplayProps {
    name: string; // room type
}
export const RoomDisplay: FC<DisplayProps> = (props) => {
    const {name} = props;

    const [room, setRoom] = useState<Rack[]>([]);
    const [clickedCage, setClickedCage] = useState<Cage>();
    const [clickedCagePartners, setClickedCagePartners] = useState<Cage[]>();
    const [cageDetails, setCageDetails] = useState<Cage[]>([]);
    const [clickedRack, setClickedRack] = useState<Rack>();
    const [isEditing, setIsEditing] = useState<boolean>(false);
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

                clickedCagePartners.forEach((cage) => {
                    updatedRoom[clickedRackIndex].cages.find(
                        (updateCage) => updateCage.id === cage.id
                    ).cageState = cage.cageState;
                })
            }
            return updatedRoom;
        });
    }

    useEffect(() => {
        console.log("Room: ", room)
    }, [room]);

    useEffect(() => {
        console.log("clicked Cage: ", clickedCage)
    }, [clickedCage]);

    useEffect(() => {
        if(!clickedCage) return;
        const newCageDetails: Cage[] = [clickedCage];
        findDetails(clickedCage, newCageDetails, clickedRack);
        setCageDetails(newCageDetails);
    }, [clickedCage]);


    useEffect(() => {
        // Load room data only once when the component mounts
        setRoom(loadRoom(name));
    }, []);

    return (
        <div className={"room-display"}>
            <CageContext.Provider value={{
                room,
                setRoom,
                clickedCage,
                setClickedCage,
                clickedRack,
                setClickedRack,
                clickedCagePartners,
                setClickedCagePartners,
                isEditing,
                setIsEditing,
                modRows,
                setModRows,
                cageDetails,
                setCageDetails,
                saveMod,
                isDirty,
                setIsDirty
            }}>
                <RoomLayout />
            </CageContext.Provider>
        </div>
    );
}