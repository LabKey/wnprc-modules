import * as React from 'react';
import { FC, useRef, useState } from 'react';
import { Cage, Rack } from './typings';
import { ReactSVG } from 'react-svg';
import { ActionURL } from '@labkey/api';
import { changeStyleProperty, parseCage, parseRack, parseSeparator } from './helpers';
import { CageDetails } from './CageDetails';

interface LayoutProps {
    room: Rack[]
}

export const RoomLayout: FC<LayoutProps> = (props) => {
    const {room} = props;
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [clickedCage, setClickedCage] = useState<Cage>();
    const [clickedRack, setClickedRack] = useState<Rack>();

    console.log("Room: ", room);

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

        console.log("Rack: ", clickedRack);
        console.log("Cage: ", clickedCage);
        setClickedCage(clickedCage);
        setClickedRack(clickedRack);
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
                }}
                afterInjection={(svg) => {
                    // Parses seperators styling them correctly
                    for (let i = 0; i < room.length; i++) {
                        const currSeparators = room[i].separators;
                        const separators = svg.querySelector(`#seperators-${i + 1}`);
                        const children = [...separators.children];
                        children.forEach((childNode) => {
                            const styles = currSeparators[parseSeparator(childNode.id)].styles;
                            styles.forEach((style) => {
                                changeStyleProperty(childNode, style.property, style.value);
                            })
                        })
                    }

                }}
            />
            {isOpen &&
                <CageDetails
                        isOpen={isOpen}
                        onClose={closeDetails}
                        cage={clickedCage}
                />
            }
        </div>
    );
}
