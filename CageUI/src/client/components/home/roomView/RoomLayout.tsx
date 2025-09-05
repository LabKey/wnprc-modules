import * as React from 'react';
import { FC, useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { ActionURL } from '@labkey/api';
import { ReactSVG } from 'react-svg';
import { Cage, RoomMods } from '../../../types/typings';
import { useHomeContext } from '../../../context/HomeContextManager';
import { addPrevRoomSvgs } from '../../../utils/helpers';
import { findCageInGroup, updateBorderSize } from '../../../utils/LayoutEditorHelpers';
import { ChangeRack } from '../../layoutEditor/ChangeRack';
import { TextInput } from '../../TextInput';
import { EditorContextMenu } from '../../layoutEditor/EditorContextMenu';
import { ModificationEditor } from './ModificationEditor';
import { ConfirmationPopup } from '../../ConfirmationPopup';
import _ from 'lodash';

interface RoomLayoutProps {
}

export const RoomLayout: FC<RoomLayoutProps> = (props) => {
    const {selectedRoom, selectedContextObj, setSelectedContextObj, roomMods, prevRoomMods} = useHomeContext();
    const [showCageContextMenu, setShowCageContextMenu] = useState<boolean>(false);
    const [showChangesMenu, setShowChangesMenu] = useState<boolean>(false);
    const [errorPopup, setErrorPopup] = useState<string>(null);
    const borderRef = useRef(null);
    const contextRef = useRef(selectedRoom);

    useEffect(() => {
        console.log("SR: ", selectedRoom);
        console.log("Prev Mods: ", prevRoomMods);
    }, [selectedRoom, prevRoomMods]);

    // Loads room into the svg
    useEffect(() => {
        if(!selectedRoom.name) return;
        if(showCageContextMenu) return;
        d3.select("#layout-svg").selectAll('*:not(#layout-border, #layout-border *)').remove();
        const layoutSvg = d3.select("#layout-svg") as d3.Selection<SVGElement, {}, HTMLElement, any>;
        contextRef.current = selectedRoom;
        console.log("Load svg, ", selectedRoom);
        addPrevRoomSvgs('view', selectedRoom, layoutSvg, roomMods, setSelectedContextObj, contextRef);
    }, [selectedRoom.name, showCageContextMenu]);


    // Effect watches for right clicks to open the modification editor
    useEffect(() => {
        if(selectedContextObj){
            console.log("Selected Obj: ", selectedContextObj);
            const currRackDefault = findCageInGroup((selectedContextObj as Cage).cageNum, selectedRoom.rackGroups).rack.type.isDefault;
            if(currRackDefault){
                setErrorPopup("This cage is a default cage and as such it cannot have mods attached. Please only attach mods to real cages");
            }else{
                setShowCageContextMenu(true);
            }
        }
    }, [selectedContextObj]);

    // Cleans up selected object after modification editor is closed
    useEffect(() => {
        if(showCageContextMenu) return;
        setSelectedContextObj(null);
    }, [showCageContextMenu]);

    useEffect(() => {
        if(!roomMods || !prevRoomMods) return;
        setShowChangesMenu((_.isEqual(prevRoomMods, roomMods)));
    }, [roomMods]);

    return (
        <div className={'room-layout'}>
            {!showChangesMenu &&
                    <div className={'room-changes-toolbar'}>
                        <div className={'room-layout-message'}>
                            Changes have been made to this room. Please save the room before continuing.
                        </div>
                    </div>
            }
            <div id={"layout-grid"}>
                <svg // svg here is the size of the border (objects outside of border ignored), add 1 to viewbox to prevent visual cutting by a pixel
                    width={selectedRoom.layoutData.borderWidth + 1}
                    height={selectedRoom.layoutData.borderHeight + 1}
                    viewBox={`0 0 ${selectedRoom.layoutData.borderWidth + 1} ${selectedRoom.layoutData.borderHeight + 1}`}
                    id="layout-svg"
                >
                    <g className={'draggable room-obj'}
                       id={'layout-border'}
                       pointerEvents={'none'}
                    >
                        <ReactSVG
                            src={`${ActionURL.getContextPath()}/cageui/static/RoomBorder.svg`}
                            id={`border_template_wrapper`}
                            wrapper={'svg'}
                            key={'border_template_key'}
                            ref={borderRef}
                            className={''}
                            viewBox={`0 0 ${selectedRoom.layoutData.borderWidth} ${selectedRoom.layoutData.borderHeight}`}
                            height={selectedRoom.layoutData.borderHeight}
                            width={selectedRoom.layoutData.borderWidth}
                            pointerEvents={'none'}
                            afterInjection={(svg) => {
                                const borderGroup = d3.select('#layout-border') as d3.Selection<SVGGElement, {}, HTMLElement, any>;
                                updateBorderSize(borderGroup, selectedRoom.layoutData.borderWidth, selectedRoom.layoutData.borderHeight)
                            }}
                        />
                    </g>
                </svg>
            </div>
            <ModificationEditor
                showEditor={showCageContextMenu}
                selectedObj={selectedContextObj}
                closeMenu={() => setShowCageContextMenu(false)}
            />
            {errorPopup &&
                    <ConfirmationPopup message={errorPopup} onClose={() => setErrorPopup(null)} />
            }
        </div>
    );
}
