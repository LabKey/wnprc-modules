import * as React from 'react';
import { FC, useState } from 'react';
import { Cage, Rack } from './typings';
import { ReactSVG } from 'react-svg';
import { ActionURL } from '@labkey/api';
import { parseCage, parseRack } from './helpers';
import { CageDetails } from './CageDetails';

interface LayoutProps {
    room: Rack[]
}

export const RoomLayout: FC<LayoutProps> = (props) => {
    const {room} = props;
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [clickedCage, setClickedCage] = useState<Cage>();
    console.log(room);

    const openDetails = () => {
        setIsOpen(true);
    }
    const closeDetails = () => {
        setIsOpen(false);
    }
    

    const handleClick = (event) => {
        const cage = event.target;
        const rackId: number = parseInt(parseRack(cage.parentElement.id));
        const cageId: number = parseInt(parseCage(cage.id));
        const clickedRack = room.find(rack => rack.id === rackId);
        const clickedCage = clickedRack.cages.find(cage => cage.id === cageId);

        console.log(clickedRack, clickedCage);
        setClickedCage(clickedCage);
        openDetails();

    };

    return (
        <div className={'room-layout'}>
            <ReactSVG
                src={`${ActionURL.getContextPath()}/cageui/static/AB140-167.svg`}
                wrapper={"div"}
                className={"room-svg"}
                beforeInjection={(svg) => {
                    const cages = svg.querySelectorAll('rect');
                    cages.forEach((cage) => {
                        cage.onclick = (event) => handleClick(event);
                    })
                    console.log(cages);
                }}
            />
            <CageDetails
                isOpen={isOpen}
                onClose={closeDetails}
                cage={clickedCage}
            />
        </div>
    );
}
