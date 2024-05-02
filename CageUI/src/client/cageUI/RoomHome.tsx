import * as React from 'react';
import {FC} from 'react';
import { RoomHeader } from './components/RoomHeader';
import { RoomLegend } from './components/RoomLegend';
import { RoomDisplay } from './components/RoomDisplay';
import '../cageui.scss';
import {Cage} from '../components/typings';

interface RoomProps {
    room: {
        name: string;
        cages: Cage[];
        type: string;
    }
}

export const RoomHome: FC<RoomProps> = (props) => {
    const {room} = props;
    return (
        <div className={"room-container"}>
            <RoomHeader
                name={room.name}
            />
            <div className={"room-sub-container"}>
                <RoomLegend />
                <RoomDisplay type={room.type}/>
            </div>
        </div>
    );
}