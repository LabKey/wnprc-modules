/*
 *
 *  * Copyright (c) 2026 Board of Regents of the University of Wisconsin System
 *  *
 *  * Licensed under the Apache License, Version 2.0 (the "License");
 *  * you may not use this file except in compliance with the License.
 *  * You may obtain a copy of the License at
 *  *
 *  *     http://www.apache.org/licenses/LICENSE-2.0
 *  *
 *  * Unless required by applicable law or agreed to in writing, software
 *  * distributed under the License is distributed on an "AS IS" BASIS,
 *  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  * See the License for the specific language governing permissions and
 *  * limitations under the License.
 *
 */

import * as React from 'react';
import { FC, useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { ActionURL } from '@labkey/api';
import { ReactSVG } from 'react-svg';
import { Cage, Room } from '../../../types/typings';
import { addPrevRoomSvgs, isRoomModifier } from '../../../utils/helpers';
import { findCageInGroup, updateBorderSize } from '../../../utils/LayoutEditorHelpers';
import { ConfirmationPopup } from '../../ConfirmationPopup';
import _ from 'lodash';
import { LayoutErrors } from '../../LayoutErrors';
import { LayoutSaveResult, SelectedObj } from '../../../types/layoutEditorTypes';
import { useRoomContext } from '../../../context/RoomContextManager';
import { LoadingScreen } from '../../LoadingScreen';
import { RoomLegend } from './RoomLegend';
import { CagePopup } from './CagePopup';
import { useHomeNavigationContext } from '../../../context/HomeNavigationContextManager';
import { RoomObjectPopup } from './RoomObjectPopup';

interface RoomLayoutProps {
}

export const RoomLayout: FC<RoomLayoutProps> = (props) => {
    const {submitLayoutMods} = useRoomContext();
    const {selectedLocalRoom, selectedRoomMods, navigateTo, userProfile, selectedRoom} = useHomeNavigationContext();
    const [selectedContextObj, setSelectedContextObj] = useState<SelectedObj>(null);
    const [showCageContextMenu, setShowCageContextMenu] = useState<boolean>(false);
    const [showObjContextMenu, setShowObjContextMenu] = useState<boolean>(false);
    const [showChangesMenu, setShowChangesMenu] = useState<boolean>(false);
    const [errorPopup, setErrorPopup] = useState<string>(null);
    const [showLayoutErrors, setShowLayoutErrors] = useState<string[]>([]);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const borderRef = useRef(null);
    const contextRef = useRef(selectedLocalRoom);

    useEffect(() => {
        console.log("Selected Room: ", selectedLocalRoom);
    }, [selectedLocalRoom]);

    // Loads room into the svg
    useEffect(() => {
        if (!selectedLocalRoom.name) {
            return;
        }
        if (showCageContextMenu || showObjContextMenu) {
            return;
        }
        d3.select('#layout-svg').selectAll('*:not(#layout-border, #layout-border *)').remove();
        const layoutSvg = d3.select('#layout-svg') as d3.Selection<SVGElement, {}, HTMLElement, any>;
        contextRef.current = selectedLocalRoom;
        addPrevRoomSvgs(userProfile,'view', selectedLocalRoom, layoutSvg,undefined, selectedLocalRoom.mods, setSelectedContextObj, contextRef);
    }, [selectedLocalRoom.name, showCageContextMenu, showObjContextMenu]);


    // Effect watches for right clicks to open the modification editor
    useEffect(() => {
        if (selectedContextObj) {
            if(selectedContextObj.selectionType === 'obj'){
                setShowObjContextMenu(true);
            }else{
                const currRackDefault = findCageInGroup((selectedContextObj as Cage).svgId, selectedLocalRoom.rackGroups).rack.type.isDefault;
                if (currRackDefault) {
                    setErrorPopup('This cage is a default cage and as such it cannot have mods attached. Please only attach mods to real cages');
                } else {
                    setShowCageContextMenu(true);
                }
            }
        }
    }, [selectedContextObj]);

    // Cleans up selected object after modification editor is closed
    useEffect(() => {
        if (showCageContextMenu || showObjContextMenu) {
            return;
        }
        setSelectedContextObj(null);
    }, [showCageContextMenu, showObjContextMenu]);

    useEffect(() => {
        if (!selectedLocalRoom.mods || !selectedRoomMods) {
            return;
        }
        setShowChangesMenu(!(_.isEqual(selectedRoomMods, selectedLocalRoom.mods)));
    }, [selectedLocalRoom.mods]);

    useEffect(() => {
        if (!selectedRoom || selectedLocalRoom.objects.length === 0) {
            return;
        }
        setShowChangesMenu(!(_.isEqual(selectedRoom.objects, selectedLocalRoom.objects)));
    }, [selectedLocalRoom.objects]);


    const saveLayout = async () => {

        let res: LayoutSaveResult = await submitLayoutMods();

        if (res.success) {
            // succssesful save
            setIsSaving(false);
            navigateTo({selected: 'Room', room: selectedLocalRoom.name});
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
            <div id={'layout-grid'} className={'room-layout-grid'}>
                <svg // svg here is the size of the border (objects outside of border ignored), add 1 to viewbox to prevent visual cutting by a pixel
                    width={selectedLocalRoom.layoutData.borderWidth + 1}
                    height={selectedLocalRoom.layoutData.borderHeight + 1}
                    viewBox={`0 0 ${selectedLocalRoom.layoutData.borderWidth + 1} ${selectedLocalRoom.layoutData.borderHeight + 1}`}
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
                            viewBox={`0 0 ${selectedLocalRoom.layoutData.borderWidth} ${selectedLocalRoom.layoutData.borderHeight}`}
                            height={selectedLocalRoom.layoutData.borderHeight}
                            width={selectedLocalRoom.layoutData.borderWidth}
                            pointerEvents={'none'}
                            afterInjection={(svg) => {
                                const borderGroup = d3.select('#layout-border') as d3.Selection<SVGGElement, {}, HTMLElement, any>;
                                updateBorderSize(borderGroup, selectedLocalRoom.layoutData.borderWidth, selectedLocalRoom.layoutData.borderHeight);
                            }}
                        />
                    </g>
                </svg>
            </div>

            {showCageContextMenu &&
                <CagePopup
                    selectedObj={selectedContextObj}
                    closeMenu={() => setShowCageContextMenu(false)}
                />
            }
            {(showObjContextMenu && isRoomModifier(userProfile)) &&
                <RoomObjectPopup
                    selectedObj={selectedContextObj}
                    closeMenu={() => setShowObjContextMenu(false)}
                />
            }
            {errorPopup &&
                    <ConfirmationPopup message={errorPopup} onClose={() => setErrorPopup(null)}/>
            }
            <RoomLegend/>
        </div>
    );
}
