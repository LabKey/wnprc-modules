import * as React from 'react';
import { FC } from 'react';
import '../../cageui.scss';
import { useHomeContext } from '../../context/HomeContextManager';

export const RoomDetailsSubView: FC = () => {
    const {selectedPage} = useHomeContext();

    return (
        <div>
            Room Details
        </div>
    );
}