import * as React from 'react';
import { FC } from 'react';
import '../../cageui.scss';
import { Cage } from '../../types/typings';
import { HomeContextProvider } from '../../context/HomeContextManager';
import { RoomList } from '../../components/home/RoomList';
import { RoomNavbar } from '../../components/home/RoomNavbar';
import { RoomContent } from '../../components/home/RoomContent';

interface RoomProps {
    room?: {
        name: string;
        cages: Cage[];
    }
}

export const RoomHome: FC<RoomProps> = (props) => {
    let {room} = props;

    if(!room){
        room = {
            name: "ab140",
            cages: []
        }
    }

    return (
        <HomeContextProvider>
            <div className={"home-container"}>
                <RoomList />
                <div className="page-content-wrapper">
                    <RoomNavbar />
                    <div className="page-content">
                        <RoomContent />
                    </div>
                </div>
            </div>
        </HomeContextProvider>
    );
}