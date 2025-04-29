import * as React from 'react';
import { FC, useEffect } from 'react';
import { Cage } from '../../types/typings';
import { findDetails } from '../../utils/homeHelpers';
import { RoomLayout } from '../home/roomView/RoomLayout';
import { useHomeContext } from '../../context/HomeContextManager';

interface DisplayProps {
    name: string; // room type
}

// This is the old room home component 2nd to the app page.
export const RoomDisplay: FC<DisplayProps> = (props) => {
    const {name} = props;

    return (
        <div className={"room-display"}>
        </div>
    );
}