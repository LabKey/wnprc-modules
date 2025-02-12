import * as React from 'react';
import { FC, useEffect } from 'react';
import { Cage } from '../../types/typings';
import { findDetails } from '../../utils/helpers';
import { RoomLayout } from './RoomLayout';
import { useRoomContext } from '../../context/ContextManager';

interface DisplayProps {
    name: string; // room type
}

// This is the old room home component 2nd to the app page.
export const RoomDisplay: FC<DisplayProps> = (props) => {
    const {name} = props;
    const {clickedCage, clickedRack, setCageDetails} = useRoomContext();

    // updates details if they change while popup is open
    useEffect(() => {
        if(!clickedCage || !clickedRack) return;
        const newCageDetails: Cage[] = [clickedCage];

        findDetails(clickedCage, newCageDetails, clickedRack);
        setCageDetails(newCageDetails);
    }, [clickedRack, clickedCage]);

    return (
        <div className={"room-display"}>
            <RoomLayout />
        </div>
    );
}