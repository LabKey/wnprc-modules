/*
 *
 *  * Copyright (c) 2025 Board of Regents of the University of Wisconsin System
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

import {
    Cage, CageWithMods,
    DefaultRackStringType,
    DefaultRackTypes,
    ModLocations,
    Rack,
    RackGroup,
    RackStringType,
    RackTypes,
    Room,
    RoomItemStringType,
    RoomItemType,
    RoomObjectStringType,
    RoomObjectTypes
} from '../types/typings';
import * as d3 from 'd3';
import { zoomTransform } from 'd3';
import { MutableRefObject } from 'react';
import { ActionURL, Filter } from '@labkey/api';
import { placeAndScaleGroup, setupEditCageEvent } from './LayoutEditorHelpers';
import { SelectDistinctOptions } from '@labkey/api/dist/labkey/query/SelectDistinctRows';
import { selectDistinctRows } from '@labkey/components';
import { Modifications } from './constants';

export const zeroPadName = (num, places) => {return(String(num).padStart(places, '0'))};

// Changes stroke color of svg element nodes keeping the other styles.
export const changeStyleProperty  = (element: Element, property: string, newValue: string): void => {
    const styleAttr = element.getAttribute('style');
    if (styleAttr) {
        const styles = styleAttr.split(';').map(style => style.trim()).filter(style => style !== "");
        let updated = false;
        const updatedStyles = styles.map(style => {
            const [prop, value] = style.split(':').map(prop => prop.trim()).filter(prop => prop !== "");
            if (prop.toLowerCase() === property.toLowerCase()) {
                updated = true;
                return `${property}: ${newValue}`;
            } else {
                return `${prop}: ${value}`;
            }
        });
        if (!updated) {
            updatedStyles.push(`${property}: ${newValue}`);
        }
        const updatedStyleAttr = updatedStyles.join(';');
        element.setAttribute('style', updatedStyleAttr);
    } else {
        element.setAttribute('style', `${property}: ${newValue}`);
    }
}

export const getSvgSize = async (type: RackTypes) => {
    const config: SelectDistinctOptions = {
        schemaName: "ehr_lookups",
        queryName: "cageui_item_types",
        column: 'description',
        filterArray: [ Filter.create('value', type, Filter.Types.EQUAL)]
    }

    const res = await selectDistinctRows(config);

    if(res.values.length === 1){
        return res.values[0];
    }

    return;
}

// matches "string-number", if a match return the number
export const parseRoomItemNum = (input: string): number => {
    const regex = /\w+-(\d+)/;

    const match = input.match(regex);
    if (match) {
        return parseInt(match[1]);
    }
    return;
}

// matches "string-number", if a match return the type/string
export const parseRoomItemType = (input: string): string => {
    const regex = /^(\w+)-\d+$/;

    const match = input.match(regex);
    if (match) {
        return match[1];
    }
    return;
}
export const extractNumbers = (input: string): number => {
    return parseInt(input.replace(/\D/g, ''));
}

export const getTypeClassFromElement = (element) => {
    const classes: string[] = Array.from(element.classList);

    // Define a regex to capture the part after "type-"
    const regex = /^type-(\w+)/;

    // Find the class that matches the regex and capture the relevant part
    const typeClass = classes.find(cls => regex.test(cls));

    if (typeClass) {
        const match = typeClass.match(regex);
        return match[1]; // Return only the captured part (after "type-")
    }

    return null;
}


export const parseLongId = (input: string) => {
    const regex = /\w+-\w+-(\d+)/; // matches "string-string-number"

    const match = input.match(regex);
    if (match) { // if a match return the number
        return parseInt(match[1]);
    }
    return;
}

export const parseLongDefaultId = (id: string): number => {
    if (!id.startsWith("default-rack-")) return 0; // Skip non-default IDs
    const numberPart = id.split('-')[2]; // Extract the number part
    return parseInt(numberPart, 10) || 0; // Fallback to 0 if invalid
}

export const formatRackId= (str: string) => {
    // Split the string by hyphens
    try {// if the rack is default split and correctly display it
        const parts = str.split('-');
        // Process each part
        const formattedParts = parts.map(part => {
            // Capitalize first letter and lowercase the rest (if it's a word)
            if (part.length > 0) {
                return convertToTitleCase(part);
            }
            return part;
        });
        // Join with spaces
        return formattedParts.join(' ');
    }
    catch {// if the rack is real display it like so
        return `Rack ${str}`;
    }



}


export const getNextDefaultRackId = (groups: RackGroup[]): string => {
    // Extract & parse only "default-rack-*" IDs
    const allRackNumbers = groups
        .flatMap(group =>
            group.racks
                .map(rack => parseLongDefaultId(rack.itemId))
                .filter(num => num > 0) // Only keep valid default-rack numbers
        )
        .sort((a, b) => a - b); // Sort ascending

    // Find the first missing number (starting from 1)
    let expectedNumber = 1;
    for (const num of allRackNumbers) {
        if (num > expectedNumber) {
            // Gap found! Use the missing number
            return `default-rack-${expectedNumber}`;
        }
        expectedNumber = num + 1;
    }

    // No gaps? Use the next number after the max
    return `default-rack-${expectedNumber}`;
}
export const convertToTitleCase = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}



export const cleanString = (name: string) => {
    return name.toLowerCase().replace(/[\s-]/g, '');
}

const generateTypeMaps = () => {
    const rackTypeToDefaultTypeMap: { [key in RackTypes]?: DefaultRackTypes } = {};
    const defaultTypeToRackTypeMap: { [key in DefaultRackTypes]?: RackTypes } = {};

    // Iterate through the enum keys and filter out numeric ones
    Object.keys(RackTypes)
        .filter((key) => isNaN(Number(key))) // Filters out numeric keys
        .forEach((key) => {
            const rackTypeKey = RackTypes[key as keyof typeof RackTypes];
            const defaultRackTypeKey = `Default${key}` as keyof typeof DefaultRackTypes;

            // Check if the corresponding DefaultRackType key exists
            if (DefaultRackTypes[defaultRackTypeKey] !== undefined) {
                const defaultRackType = DefaultRackTypes[defaultRackTypeKey];

                // Assign mappings
                rackTypeToDefaultTypeMap[rackTypeKey as RackTypes] = defaultRackType;
                defaultTypeToRackTypeMap[defaultRackType] = rackTypeKey as RackTypes;
            }
        });

    return { rackTypeToDefaultTypeMap, defaultTypeToRackTypeMap };
}

// These two maps can be imported and used to convert between the string and number of the rack type enum
const { rackTypeToDefaultTypeMap, defaultTypeToRackTypeMap } = generateTypeMaps();

export const rackTypeToDefaultType = (type: RackTypes) => {
    return rackTypeToDefaultTypeMap[type];
}

export const defaultTypeToRackType = (type: DefaultRackTypes) => {
    return defaultTypeToRackTypeMap[type];
}

/*
   parse a room iteam to a string
 */
export const roomItemToString = (item: RoomItemType): RoomItemStringType => {
    let itemString: RoomItemStringType;
    // Uppercase the first letter of the string
    const rackString = RackTypes[item];
    const roomObjString = RoomObjectTypes[item];
    const defaultRackString = DefaultRackTypes[item];

    if(rackString){
        itemString = rackString.charAt(0).toLowerCase() + rackString.slice(1) as RackStringType;
    }else if (defaultRackString){
        itemString = defaultRackString.charAt(0).toLowerCase() + defaultRackString.slice(1) as DefaultRackStringType;

    }else{
        itemString = roomObjString.charAt(0).toLowerCase() + roomObjString.slice(1) as RoomObjectStringType;
    }
    return itemString;
}

/*
 Extract the item type from a string
 */
export const stringToRoomItem = (formattedString: RoomItemStringType): RoomItemType => {
    // Uppercase the first letter of the string
    const itemKey = formattedString.charAt(0).toUpperCase() + formattedString.slice(1);

    const rackItem = RackTypes[itemKey as keyof typeof RackTypes];
    const objItem = RoomObjectTypes[itemKey as keyof typeof RoomObjectTypes];
    const defaultRackItem = DefaultRackTypes[itemKey as keyof typeof DefaultRackTypes];

    // Use the EnumType object to look up the value
    return rackItem || defaultRackItem || objItem;
}

// Adds the svgs from the saved layouts to the DOM. Mode edit is version displayed in the layout editor and view is the one in the home views.
export const addPrevRoomSvgs = (mode: 'edit' | 'view', unitsToRender: Room | RackGroup | Rack | Cage, layoutSvg: d3.Selection<SVGElement, {}, HTMLElement, any>, setSelectedObj?, contextMenuRef?: MutableRefObject<Room>, setCtxMenuStyle?, closeMenuThenDrag?) => {
    let renderType: 'room' | 'group' | 'rack' | 'cage';
    let minX;
    let minY;
    if((unitsToRender as Room)?.rackGroups){
        renderType = 'room';
    } else if((unitsToRender as RackGroup)?.racks){ // we are rendering a single rack group
        renderType = 'group';
        let tempX = (unitsToRender as RackGroup).x;
        let tempY = (unitsToRender as RackGroup).y;
        (unitsToRender as RackGroup).racks.forEach(r => {
            if(tempX + r.x < tempX){
                tempX = tempX + r.x;
            }
            if(tempY + r.y < tempY){
                tempY = tempY + r.y;
            }
            r.cages.forEach(c => {
                if(tempX + c.x < tempX){
                    tempX = tempX + c.x
                }
                if(tempY + c.y < tempY){
                    tempY = tempY + c.y;
                }
            })
        })
        minX = tempX;
        minY = tempY;
    }else if((unitsToRender as Rack)?.cages){ // we are rendering a single rack
        renderType = 'rack';

    }else{ // we are rendering a single cage
        renderType = 'cage';
    }

    const loadCageMods = (cageToLoad: CageWithMods, shape: d3.Selection<SVGElement, unknown, null, undefined>) => {

        Object.entries(cageToLoad.mods).forEach(([loc,modList]) => {
            const modLoc = parseInt(loc) as ModLocations;
            modList.forEach((mod) => {
                if(mod.mod === "newMod") return;
                const modObj = Modifications[mod.mod];
                modObj.svgIds[modLoc].forEach((svgId, idx) => {
                    const idParts = svgId.split('-');
                    let modId = `${idParts[0]}-${mod.id}`;
                    let currentSelection: d3.Selection<SVGElement, unknown, null, undefined> = shape.select(`#${modId}`);
                    for (let i = 1; i < idParts.length; i++) {
                        if (currentSelection.empty()) return null;
                        currentSelection = currentSelection.select(`#${idParts[i]}`);
                    }
                    modObj.styles.forEach((style) => {
                        changeStyleProperty(currentSelection.node() as SVGElement, style.property, style.value)
                    })
                })
            })
        })

    }

    const createRackGroup = (parentGroup, rack: Rack, isSingleRack) => {
        const rackTypeString: RackStringType = roomItemToString(rack.type.type) as RackStringType;

        const rackGroup = isSingleRack ? parentGroup : parentGroup.append('g')
            .attr('id', rack.itemId)
            .attr('class', `rack type-${rackTypeString}`)
            .attr('transform', `translate(${rack.x},${rack.y})`)
            .style('pointer-events', 'bounding-box');

        rack.cages.forEach(async (cage) => {
            const cageGroup = rackGroup.append('g')
                .attr('id', cage.cageNum)
                .attr('transform', `translate(${cage.x},${cage.y})`);

            let unitSvg: SVGElement;
            if (mode === 'edit') {
                unitSvg = (d3.select(`[id=${rackTypeString}_template_wrapper]`) as d3.Selection<SVGElement, {}, HTMLElement, any>)
                    .node().cloneNode(true) as SVGElement;
            } else if (mode === 'view') {
                await d3.svg(`${ActionURL.getContextPath()}/cageui/static/${rackTypeString}.svg`).then((d) => {
                    unitSvg = d.querySelector(`svg[id*=template]`);
                });
            }


            // Only needed for layout editor to attach context menus
            const shape = d3.select(unitSvg);
            shape.classed('draggable', false);
            shape.style('pointer-events', 'none');

            const cageGroupContext = shape.select(`#${rackTypeString}`).node() as SVGGElement;
            setupEditCageEvent( cageGroupContext, setSelectedObj, contextMenuRef,setCtxMenuStyle, rackTypeString);
            (shape.select('tspan').node() as SVGTSpanElement).textContent = `${parseRoomItemNum(cage.cageNum)}`;

            if(mode ==='view'){
                loadCageMods(cage, shape);
            }

            cageGroup.append(() => shape.node());

        });

        return rackGroup;
    };

    const createGroup = (group: RackGroup) => {
        const isSingleRack = group.racks.length === 1;
        const parentGroup = isSingleRack
            ? layoutSvg.append('g')
                .attr('id', group.racks[0].itemId)
                .attr('class', `draggable rack type-${roomItemToString(group.racks[0].type.type)}`)
                .style('pointer-events', 'bounding-box')
            : layoutSvg.append('g')
                .attr('id', group.groupId)
                .attr('class', 'draggable rack-group');

        group.racks.forEach(async rack => {
            // Use parent group as rackGroup if only 1 rack, otherwise create a new rack group
            await createRackGroup(parentGroup, rack, isSingleRack);
        });
        let groupX = renderType === 'room' ? group.x : group.racks[0].x;
        let groupY = renderType === 'room' ? group.y : group.racks[0].y;
        placeAndScaleGroup(parentGroup, groupX, groupY, zoomTransform(layoutSvg.node()));
        if (mode === 'edit') {
            parentGroup.call(closeMenuThenDrag);
        }
    };

    // We are loading an entire room into the svg
    if(renderType === 'room'){
        (unitsToRender as Room).rackGroups.forEach((group) => {
            createGroup(group);
        });

        (unitsToRender as Room).objects.forEach(async (roomObj) => {
            const roomObjGroup = layoutSvg.append('g')
                .data([{x: roomObj.x, y: roomObj.y}])
                .attr('id', roomObj.itemId)
                .attr('class', 'draggable room-obj')
                .attr('transform', `translate(${roomObj.x}, ${roomObj.y}) scale(${mode === "edit" ? roomObj.scale : 1})`)
                .style('pointer-events', 'bounding-box');

            let objSvg: SVGElement;

            if (mode === 'edit') {
                objSvg = (d3.select(`[id=${roomItemToString(roomObj.type)}_template_wrapper]`) as d3.Selection<SVGElement, {}, HTMLElement, any>).node().cloneNode(true) as SVGElement;
            } else if (mode === 'view') {
                await d3.svg(`${ActionURL.getContextPath()}/cageui/static/${roomItemToString(roomObj.type)}.svg`).then((d) => {
                    (roomObjGroup.node() as SVGElement).appendChild(d.documentElement);
                });
                return;
            }

            const shape = d3.select(objSvg)
                .classed('draggable', false)
                .attr('pointer-events', 'none');


            roomObjGroup.append(() => shape.node());
            placeAndScaleGroup(roomObjGroup, roomObj.x, roomObj.y, zoomTransform(layoutSvg.node()));
            setupEditCageEvent(roomObjGroup.node() as SVGGElement, setSelectedObj, contextMenuRef, setCtxMenuStyle);
            roomObjGroup.call(closeMenuThenDrag);
        });
    } else if(renderType === 'group'){ // we are rendering a single rack group
        createGroup(unitsToRender as RackGroup);

    }else if(renderType === 'rack'){ // we are rendering a single rack
    }else{ // we are rendering a single cage
        const cage: CageWithMods = unitsToRender as Cage;
        const cageGroup = layoutSvg.append('g')
            .attr('id', cage.cageNum)
            .attr('transform', `translate(0,0)`);
        let unitSvg: SVGElement;

        d3.svg(`${ActionURL.getContextPath()}/cageui/static/${parseRoomItemType((unitsToRender as Cage).cageNum)}.svg`).then((d) => {
            unitSvg = d.querySelector(`svg[id*=template]`);
            const shape = d3.select(unitSvg);
            (shape.select('tspan').node() as SVGTSpanElement).textContent = `${parseRoomItemNum((unitsToRender as Cage).cageNum)}`;

            if(mode ==='view'){
                loadCageMods(cage, shape);
            }
            cageGroup.append(() => shape.node());
        });
    }
};