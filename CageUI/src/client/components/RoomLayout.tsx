import * as React from 'react';
import { FC, useState } from 'react';
import { Cage } from './typings';
import { ReactSVG } from 'react-svg';
import { ActionURL } from '@labkey/api';
import {
    changeStyleProperty, findCagePartners, getCageMod,
    getRackSeparators,
    parseCage,
    parseRack,
    parseSeparator
} from './helpers';
import { CageDetails } from './CageDetails';
import { useCurrentContext } from './ContextManager';

export const RoomLayout: FC = () => {
    const {room, setClickedCage, setClickedRack, setClickedCagePartners, setIsDirty} = useCurrentContext();
    const [isOpen, setIsOpen] = useState<boolean>(false);

    const openDetails = () => {
        setIsOpen(true);
    }
    const closeDetails = () => {
        setIsOpen(false);
        setIsDirty(false);
    }
    
    const handleClick = (event) => {
        const cage = event.target;
        const rackId: number = parseInt(parseRack(cage.id));
        const cageId: number = parseInt(parseCage(cage.id));
        //const cageId: number = room
        const clickedRack = room.find(rack => rack.id === rackId);
        const clickedCage = clickedRack.cages[cageId - 1];

        const newCagePartners: Cage[] = [clickedCage];
        findCagePartners(clickedCage, clickedRack, newCagePartners);
        setClickedCage(clickedCage);
        setClickedRack(clickedRack);
        setClickedCagePartners(newCagePartners);
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
                    // Update room numbers with following the current room layout
                    room.forEach((rack) => {
                        rack.cages.forEach((cage) => {
                            // Construct the expected text element ID
                            const textId = `text-${cage.id}-${rack.id + 1}`;
                            // Find the corresponding text element
                            const textElement = svg.querySelector(textId);

                            if (textElement) {
                                // Get the tspan child and update its content
                                const tspanElement = textElement.querySelector('tspan');
                                if (tspanElement) {
                                    tspanElement.textContent = cage.id.toString();
                                }
                            }
                        });
                    });
                }}
                afterInjection={(svg) => {
                    // Parses seperators styling them correctly
                    for (let i = 0; i < room.length; i++) {
                        const currSeparators = getRackSeparators(room[i]);
                        const separators = svg.querySelector(`#seperators-${i + 1}`);
                        const children = [...separators.children];
                        const mods = svg.querySelector(`#modifications-${i + 1}`);
                        console.log("Room ", room[i]);
                        //Update modification svg props
                        [...mods.children].forEach((childNode) => {
                            const cageMod = getCageMod(childNode.id, room[i]);
                            const styles = cageMod?.styles
                            //console.log(childNode.id, cageMod)
                            if(parseSeparator(childNode.id) === "CTunnel"){ // CTunnels have multiple sub styles
                                [...childNode.children].forEach((subChildNode) => {
                                    styles?.forEach((style) => {
                                        changeStyleProperty(subChildNode, style.property, style.value);
                                    })
                                })
                            }else{
                                styles?.forEach((style) => {
                                    changeStyleProperty(childNode, style.property, style.value);
                                })
                            }
                        })

                        // Update separator svg props
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
