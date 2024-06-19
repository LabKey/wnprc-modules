import * as React from 'react';
import {FC} from 'react';

interface HeaderProps {
    name: string;
}
export const RoomHeader: FC<HeaderProps> = (props) => {
    const {name} = props;
    return (
        <div className={"room-header"}>
            <h1 className={"room-header-text"}>Room - </h1>
            <h1 className={"room-header-name"}>{name}</h1>
        </div>
    );
}