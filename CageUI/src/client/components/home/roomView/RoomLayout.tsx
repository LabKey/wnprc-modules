import * as React from 'react';
import { FC, useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { ActionURL } from '@labkey/api';
import { ReactSVG } from 'react-svg';
import { Cage } from '../../../types/typings';
import { addPrevRoomSvgs } from '../../../utils/helpers';
import { findCageInGroup, updateBorderSize } from '../../../utils/LayoutEditorHelpers';
import { ChangeRack } from '../../layoutEditor/ChangeRack';
import { TextInput } from '../../TextInput';
import { EditorContextMenu } from '../../layoutEditor/EditorContextMenu';
import { ModificationEditor } from './ModificationEditor';
import { ConfirmationPopup } from '../../ConfirmationPopup';
import _ from 'lodash';
import { LayoutErrors } from '../../LayoutErrors';
import { LayoutSaveResult, SelectedObj } from '../../../types/layoutEditorTypes';
import { useRoomContext } from '../../../context/RoomContextManager';
import { LoadingScreen } from '../../LoadingScreen';
import { RoomLegend } from './RoomLegend';

interface RoomLayoutProps {
}

export const RoomLayout: FC<RoomLayoutProps> = (props) => {
    const {selectedRoom, selectedRoomMods, submitLayoutMods, switchToRoom} = useRoomContext();
    const [selectedContextObj, setSelectedContextObj] = useState<SelectedObj>(null);
    const [showCageContextMenu, setShowCageContextMenu] = useState<boolean>(false);
    const [showChangesMenu, setShowChangesMenu] = useState<boolean>(false);
    const [errorPopup, setErrorPopup] = useState<string>(null);
    const [showLayoutErrors, setShowLayoutErrors] = useState<string[]>([]);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const borderRef = useRef(null);
    const contextRef = useRef(selectedRoom);

    useEffect(() => {
        console.log('Room Layout Selected Room: ', selectedRoom);
    }, [selectedRoom]);

    // Loads room into the svg
    useEffect(() => {
        if (!selectedRoom.name) {
            return;
        }
        if (showCageContextMenu) {
            return;
        }
        d3.select('#layout-svg').selectAll('*:not(#layout-border, #layout-border *)').remove();
        const layoutSvg = d3.select('#layout-svg') as d3.Selection<SVGElement, {}, HTMLElement, any>;
        contextRef.current = selectedRoom;
        addPrevRoomSvgs('view', selectedRoom, layoutSvg, selectedRoom.mods, setSelectedContextObj, contextRef);
    }, [selectedRoom.name, showCageContextMenu]);


    // Effect watches for right clicks to open the modification editor
    useEffect(() => {
        if (selectedContextObj) {
            const currRackDefault = findCageInGroup((selectedContextObj as Cage).svgId, selectedRoom.rackGroups).rack.type.isDefault;
            if (currRackDefault) {
                setErrorPopup('This cage is a default cage and as such it cannot have mods attached. Please only attach mods to real cages');
            } else {
                setShowCageContextMenu(true);
            }
        }
    }, [selectedContextObj]);

    // Cleans up selected object after modification editor is closed
    useEffect(() => {
        if (showCageContextMenu) {
            return;
        }
        setSelectedContextObj(null);
    }, [showCageContextMenu]);

    useEffect(() => {
        if (!selectedRoom.mods || !selectedRoomMods) {
            return;
        }
        setShowChangesMenu(!(_.isEqual(selectedRoomMods, selectedRoom.mods)));
    }, [selectedRoom.mods]);


    const saveLayout = async () => {

        let res: LayoutSaveResult = await submitLayoutMods();
        console.log('Save Layout Result: ', res);

        if (res.success) {
            // succssesful save
            setIsSaving(false);
            switchToRoom(selectedRoom.name);
        } else {
            if (res?.reason) {
                setShowLayoutErrors(res.reason);
            } else {
                setShowLayoutErrors(['Unknown error occurred. Please try again or submit a ticket.']);
            }
            setIsSaving(false);
        }

    };

    return (
        <div className={'room-layout'} id={'room-layout-container'}>
            {isSaving && <LoadingScreen isVisible={isSaving}
                                        targetElement={document.getElementById('room-layout-container')}
            />}
            <div className={'room-layout-toolbar'}>
                {showChangesMenu &&
                        <div className={'room-changes-toolbar'}>
                            <div className={'room-layout-message'}>
                                Changes have been made to this room. Please save before continuing.
                            </div>
                            <button className={'room-layout-save-btn'}
                                    onClick={async () => {
                                        setIsSaving(true);
                                        await saveLayout();
                                    }}
                                    disabled={isSaving}
                            >
                                Save
                            </button>
                        </div>
                }
                {showLayoutErrors && showLayoutErrors.length > 0 &&
                        <LayoutErrors
                                errors={showLayoutErrors}
                        />
                }
            </div>
            <div id={'layout-grid'}>
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
                                updateBorderSize(borderGroup, selectedRoom.layoutData.borderWidth, selectedRoom.layoutData.borderHeight);
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
                    <ConfirmationPopup message={errorPopup} onClose={() => setErrorPopup(null)}/>
            }
            <RoomLegend/>
        </div>
    );
}
