import * as React from 'react';
import { FC, useState } from 'react';
import { Cage, Rack } from './typings';
import {loadRoom} from './helpers';
import { RoomLayout } from './RoomLayout';

interface DisplayProps {
    name: string; // room type
}
export const RoomDisplay: FC<DisplayProps> = (props) => {
    const {name} = props;
    const [currRoom, setCurrRoom] = useState<Rack[]>(loadRoom(name));
    // insert logic to find room
    return (
        <div className={"room-display"}>
            <RoomLayout
                room={currRoom}
            />
        </div>
    );
}