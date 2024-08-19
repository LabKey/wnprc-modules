import * as React from 'react';
import { FC, useState, useEffect } from 'react';
import { Cage, Rack } from './typings';
import { findDetails, loadRoom } from './helpers';
import { RoomLayout } from './RoomLayout';
import { useRoomContext } from './ContextManager';

interface DisplayProps {
    name: string; // room type
}
export const RoomDisplay: FC<DisplayProps> = (props) => {
    const {name} = props;
    const {room, clickedCage, clickedRack, setCageDetails, setRoom} = useRoomContext();

    // updates details if they change while popup is open
    useEffect(() => {
        if(!clickedCage || !clickedRack) return;
        const newCageDetails: Cage[] = [clickedCage];

        findDetails(clickedCage, newCageDetails, clickedRack);
        setCageDetails(newCageDetails);
    }, [clickedRack, clickedCage]);


    useEffect(() => {
        // Load room data only once when the component mounts
        setRoom(loadRoom(name));
    }, []);

    return (
        <div className={"room-display"}>
            <RoomLayout />
        </div>
    );
}