import * as React from 'react';
import { FC, useState } from 'react';
import { Cage, ModTypes, RackTypes } from './typings';
import { ReactSVG } from 'react-svg';
import { ActionURL } from '@labkey/api';
import {
    changeStyleProperty,
    getCageUnderneath,
    getRackSeparators,
    parseCage,
    parseRack,
    parseSeparator
} from './helpers';
import { CageDetails } from './CageDetails';
import { useCurrentContext } from './ContextManager';

export const RoomLayout: FC = () => {
    const {room, setCageDetails, setClickedCage, setClickedRack, setClickedCagePartner, cageDetails} = useCurrentContext();
    const [isOpen, setIsOpen] = useState<boolean>(false);

    const openDetails = () => {
        setIsOpen(true);
    }
    const closeDetails = () => {
        setIsOpen(false);
    }
    
    console.log("room: ", room);
    const handleClick = (event) => {
        const cage = event.target;
        const rackId: number = parseInt(parseRack(cage.parentElement.id));
        const cageId: number = parseInt(parseCage(cage.id));
        console.log("New Room: ", room);
        const clickedRack = room.find(rack => rack.id === rackId);
        const clickedCage = clickedRack.cages.find(cage => cage.id === cageId);
        let clickedCagePartner: Cage;
        const newCageDetails: Cage[] = [];
        if(clickedRack.type === RackTypes.TwoOfTwo){
            newCageDetails.push(clickedCage);
            if(clickedCage.cageState.rightDivider){
                clickedCagePartner = clickedRack.cages.find(cage => cage.id === cageId + 1);
                if(clickedCage.cageState.rightDivider.modData.mod === ModTypes.NoDivider){
                    newCageDetails.push(clickedCagePartner);
                }
            }else if(clickedCage.cageState.leftDivider){
                clickedCagePartner = clickedRack.cages.find(cage => cage.id === cageId - 1);
                if(clickedCage.cageState.leftDivider.modData.mod === ModTypes.NoDivider){
                    newCageDetails.push(clickedCagePartner);
                }
            }
            // TODO Add floors
            if(clickedCage.cageState?.floor.modData.mod.mod === ModTypes.NoFloor){
                const totalCages = room.length * room[0].cages.length;
                const bottomCageId = getCageUnderneath(totalCages, room[0].cages.length, clickedCage.id)
                console.log("Floor: ", bottomCageId);
                //newCageDetails.push(clickedRack.cages[3]);
            }
        }
        console.log("New Rack: ", clickedRack);
        console.log("New Cage: ", clickedCage);
        console.log("New Cage Partner: ", clickedCagePartner);
        console.log("New Cage details: ", cageDetails, newCageDetails);
        setClickedCage(clickedCage);
        setClickedRack(clickedRack);
        setClickedCagePartner(clickedCagePartner);
        setCageDetails(newCageDetails);
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
                        const currSeparators = getRackSeparators(room[i]);
                        const separators = svg.querySelector(`#seperators-${i + 1}`);
                        const children = [...separators.children];
                        children.forEach((childNode) => {
                            const styles = currSeparators.find(sep => sep.position === parseSeparator(childNode.id)).mod.styles;
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
                />
            }
        </div>
    );
}
