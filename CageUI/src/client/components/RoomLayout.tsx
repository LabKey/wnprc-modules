import * as React from 'react';
import { FC, useState } from 'react';
import { ReactSVG } from 'react-svg';
import { ActionURL } from '@labkey/api';
import {
    changeStyleProperty,
    getCageMod,
    getRackSeparators,
    parseCage, parseEditRect,
    parseRack,
    parseSeparator, updateCageIds
} from './helpers';
import { useCurrentContext } from './ContextManager';
import { Popup } from './Popup';
import { CageDetailsModifications } from './CageDetailsModifications';
import { CageExtraDetails } from './CageExtraDetails';

export const RoomLayout: FC = () => {
    const {room, cageDetails, setClickedCage, setClickedRack, setIsDirty, isEditingRoom, setRoom} = useCurrentContext();
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
        const tempClickedRack = room.find(rack => rack.id === rackId);
        const clickedCage = tempClickedRack.cages[cageId - 1];
        setClickedCage(clickedCage);
        setClickedRack(tempClickedRack);

        openDetails();
    };

    const handleRackEdit = (event) => {
        const rackId: number = parseInt(parseEditRect(event.target.id));

        setRoom((prevRoom) => {
            const updatedRacks = prevRoom.map((rack) =>
                rack.id === rackId ? { ...rack, isActive: !rack.isActive } : rack
            );
            const temp = updateCageIds(updatedRacks);
            console.log(temp);
            return temp;
        });
    }

    return (
        <div className={'room-layout'}>
            <ReactSVG
                src={`${ActionURL.getContextPath()}/cageui/static/AB140-167.svg`}
                wrapper={"div"}
                className={"room-svg"}
                beforeInjection={(svg) => {
                    room.forEach((rack) => {
                        rack.cages.forEach((cage, idx) => {
                            // Construct the expected text element ID
                            const textId = `text-${idx + 1}-${rack.id}`;
                            // Find the corresponding text element
                            const textElement = svg.querySelector(`#${textId}`);
                            const tempCage:SVGRectElement = svg.querySelector(`#rect-${idx + 1}-${rack.id}`);

                            if (textElement) {
                                // Get the tspan child and update its content
                                const tspanElement = textElement.querySelector('tspan');
                                if (tspanElement) {
                                    if(rack.isActive){
                                        tspanElement.textContent = cage.id.toString();
                                        tempCage.onclick = (event) => handleClick(event);
                                    }else{
                                        tspanElement.textContent = "";
                                    }
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
                        const editMode =  svg.querySelector(`#edit-${i + 1}`);

                        // Determines if room is in editing mode and displays proper svg contents if so
                        [...editMode.children].forEach((childNode: SVGElement) => {
                            if(isEditingRoom) {
                                if (childNode.id.includes("blur")) { // adds click event and styles to edit blur box
                                    changeStyleProperty(childNode, "fill", "lightgray");
                                    changeStyleProperty(childNode, "fill-opacity", "0.8");
                                    childNode.style.pointerEvents = "auto";
                                    childNode.onclick = (event) => handleRackEdit(event);
                                } else {
                                    //Determines which icon to display (add or remove rack (circle plus/minus))
                                    if ((room[i].isActive && childNode.id.includes("del")) || (!room[i].isActive && childNode.id.includes("add"))) {
                                        changeStyleProperty(childNode, "fill", "black");
                                    }
                                }
                            }else{
                                if (childNode.id.includes("blur")) { // makes sure only one rect is clickable (blur vs cage details)
                                    childNode.style.pointerEvents = "none";
                                }
                            }
                        });
                        //Update modification svg props
                        [...mods.children].forEach((childNode) => {
                            const cageMod = getCageMod(childNode.id, room[i]);
                            const styles = cageMod?.styles
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
                <Popup
                    isOpen={isOpen}
                    onClose={closeDetails}
                    header={`Cage ${cageDetails.map((cage) => cage.name).join(", ")}`}
                    subheader={["Total: 2", "Status: OK"]}
                    mainContent={
                        <>
                            <CageDetailsModifications
                                closeDetails={closeDetails}
                            />
                            <div className={"divider"}/>
                            <CageExtraDetails/>
                        </>
                    }
                />
            }
        </div>
    );
}
