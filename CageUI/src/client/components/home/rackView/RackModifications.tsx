import * as React from 'react';
import { FC } from 'react';
import '../../../cageui.scss';
import { useHomeContext } from '../../../context/HomeContextManager';

export const RackModifications: FC = () => {
    const {selectedPage, selectedRoom, selectedRack} = useHomeContext();


    return (
        <div>
            Rack Modifications
        </div>
    );
}