import * as React from 'react';
import { FC, useState } from 'react';
import { Cage, Rack } from '../../components/typings';
import {loadRoom} from '../../components/helpers';
import { RoomLayout } from './RoomLayout';

interface DisplayProps {
    type: string; // room type
}
export const RoomDisplay: FC<DisplayProps> = (props) => {
    const {type} = props;
    const [currRoom, setCurrRoom] = useState<Rack[]>(loadRoom(type));
    // insert logic to find ro
    return (
        <div className={"room-display"}>
            <RoomLayout
                room={currRoom}
            />
        </div>
    );
}