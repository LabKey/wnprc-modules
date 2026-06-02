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
import { FC, ReactElement, useEffect, useRef, useState } from 'react';
import '../../cageui.scss';
import { Button } from 'react-bootstrap';
import { parseRoomItemType, stringToRoomItem } from '../../utils/helpers';
import {
    Cage,
    DefaultRackTypes, Rack, RackGroup,
    RackStringType,
    RackTypes,
    RoomItemType,
    RoomObject,
    RoomObjectTypes
} from '../../types/typings';
import { SelectedObj } from '../../types/layoutEditorTypes';
import { useLayoutEditorContext } from '../../context/LayoutEditorContextManager';
import { findCageInGroup } from '../../utils/LayoutEditorHelpers';

interface Option {
    label: string;
    value: number;
}

interface EditorContextMenuProps {
    ctxMenuStyle: {
        display: string;
        top: string;
        left: string;
    };
    type: 'object' | 'caging'; // context menu for caging or room objects
    selectedObj: SelectedObj;
    closeMenu: () => void;
    onClickDelete?: (type?: string) => void;
    menuItems?: { element: ReactElement, types: RoomItemType[], title: string }[]; // for types, an array of types to render this element for. If empty it will render the component for all types.
}

/*
    Context menu for room item. Renders differently depending on assigned type and passed in components.

 */
export const EditorContextMenu: FC<EditorContextMenuProps> = (props) => {
    const {
        ctxMenuStyle,
        onClickDelete,
        closeMenu,
        menuItems,
        selectedObj,
        type
    } = props;

    const {localRoom, unmergeRacks} = useLayoutEditorContext();
    const menuRef = useRef<HTMLDivElement>(null);

    const [selectedRack, setSelectedRack] = useState<Rack>();
    const [selectedRackGroup, setSelectedRackGroup] = useState<RackGroup>();

    useEffect(() => {
        if(selectedObj.selectionType === 'cage'){
            const {rack, rackGroup} = findCageInGroup((selectedObj as Cage).svgId, localRoom.rackGroups);
            setSelectedRack(rack);
            setSelectedRackGroup(rackGroup);
        }
    }, [selectedObj]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            // Check if the click was outside the menu
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                closeMenu();
            }
        };

        // Add event listener to detect clicks
        document.addEventListener('mousedown', handleClickOutside);

        // Cleanup event listener on component unmount
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [closeMenu]);

    // Handle dynamic positioning
    useEffect(() => {
        if (!menuRef.current || ctxMenuStyle.display !== 'block') return;

        const menu = menuRef.current;
        const { top, left } = ctxMenuStyle;
        const topValue = parseInt(top, 10);
        const leftValue = parseInt(left, 10);

        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        const menuWidth = menu.offsetWidth;
        const menuHeight = menu.offsetHeight;

        let adjustedTop = topValue;
        let adjustedLeft = leftValue;

        // Prevent overflow to the right
        if (leftValue + menuWidth > windowWidth) {
            adjustedLeft = windowWidth - menuWidth - 10;
        }

        // Prevent overflow to the bottom
        if (topValue + menuHeight > windowHeight) {
            adjustedTop = windowHeight - menuHeight - 10;
        }

        // Prevent overflow to the left
        if (adjustedLeft < 10) adjustedLeft = 10;

        // Prevent overflow to the top
        if (adjustedTop < 10) adjustedTop = 10;

        menu.style.left = `${adjustedLeft}px`;
        menu.style.top = `${adjustedTop}px`;
    }, [ctxMenuStyle.display, ctxMenuStyle.left, ctxMenuStyle.top]);


    // Delete object for room objects
    const handleDeleteObject = (e: React.MouseEvent<HTMLElement>) => {
        e.stopPropagation();
        onClickDelete();
    };

    // Delete cage and rack for caging units
    const handleDeleteCage = (e: React.MouseEvent<HTMLElement>) => {
        e.stopPropagation();
        onClickDelete('cage');
    };
    const handleDeleteRack = (e: React.MouseEvent<HTMLElement>) => {
        e.stopPropagation();
        onClickDelete('rack');
    };

    const handleUnmergeRack = (e: React.MouseEvent<HTMLElement>) => {
        e.stopPropagation();
        unmergeRacks(selectedRackGroup, selectedRack);
        closeMenu();
    }

    return (
        <div id="contextMenu" className="context-menu" ref={menuRef} style={{
            display: ctxMenuStyle.display,
            left: ctxMenuStyle.left,
            top: ctxMenuStyle.top,
            width: 'auto',
            height: 'auto'
        }}>
            {menuItems && menuItems.map((item, index) => {
                let selectedObjType = selectedObj.selectionType === 'obj' ? (selectedObj as RoomObject).type : stringToRoomItem(parseRoomItemType((selectedObj as Cage).cageNum) as RackStringType);
                if (item.types.length === 0) {// if no types were given render, otherwise only render elements for that type
                    return (
                        <div className={'menu-item'} key={`context-menu-item-${index}`}>
                            <label>{item.title}</label>
                            {item.element}
                        </div>
                    );
                }
                if (item.types.includes(selectedObjType as RackTypes | RoomObjectTypes | DefaultRackTypes)) {
                    return (
                        <div className={'menu-item'} key={`context-menu-item-${index}`}>
                            <label>{item.title}</label>
                            {item.element}
                        </div>
                    );
                }
            })}
            <div className="menu-item">
                {type === 'object' ?
                    <Button
                        variant={'primary'}
                        onClick={handleDeleteObject}
                    >
                        Delete Object
                    </Button>
                    :
                    <div className={'menu-item-group'}>
                        <Button
                            variant={'primary'}
                            onClick={handleDeleteCage}
                        >
                            Delete Cage
                        </Button>

                        <Button
                            variant={'primary'}
                            onClick={handleDeleteRack}
                        >
                            Delete Rack
                        </Button>

                        <Button
                            variant={'primary'}
                            onClick={handleUnmergeRack}
                        >
                            Unmerge Rack
                        </Button>
                    </div>
                }
            </div>
        </div>
    );
};