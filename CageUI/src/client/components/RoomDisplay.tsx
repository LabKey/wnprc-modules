import * as React from 'react';
import { FC, useState, useEffect } from 'react';
import { Cage, Rack } from './typings';
import {loadRoom} from './helpers';
import { RoomLayout } from './RoomLayout';
import { CageContext } from './ContextManager';

interface DisplayProps {
    name: string; // room type
}
export const RoomDisplay: FC<DisplayProps> = (props) => {
    const {name} = props;

    const [room, setRoom] = useState<Rack[]>([]);
    const [clickedCage, setClickedCage] = useState<Cage>();
    const [clickedCagePartner, setClickedCagePartner] = useState<Cage>();
    const [clickedRack, setClickedRack] = useState<Rack>();
    const [cageDetails, setCageDetails] = useState<Cage[]>([]);


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
                clickedCagePartner,
                setClickedCagePartner,
                cageDetails,
                setCageDetails
            }}>
                <RoomLayout />
            </CageContext.Provider>
        </div>
    );
}