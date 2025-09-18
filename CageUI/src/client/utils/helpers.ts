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
    Cage,
    CageModificationsType,
    CageNumber, CageSvgId, CurrCageMods,
    DefaultRackId,
    DefaultRackStringType,
    DefaultRackTypes,
    GroupId,
    LayoutHistoryData,
    ModLocations,
    ModTypes,
    PrevRoom,
    Rack,
    RackGroup,
    RackStringType,
    RackTypes,
    RealRackId,
    Room,
    RoomItemStringType,
    RoomItemType,
    RoomMods,
    RoomObject,
    RoomObjectStringType,
    RoomObjectTypes,
    UnitLocations,
    UnitType
} from '../types/typings';
import * as d3 from 'd3';
import { zoomTransform } from 'd3';
import { MutableRefObject } from 'react';
import { ActionURL, Filter } from '@labkey/api';
import {
    createEmptyUnitLoc,
    isRackDefault,
    isRackEnum,
    placeAndScaleGroup,
    setupEditCageEvent
} from './LayoutEditorHelpers';
import { SelectDistinctOptions } from '@labkey/api/dist/labkey/query/SelectDistinctRows';
import { generateId, selectDistinctRows } from '@labkey/components';
import { CELL_SIZE, Modifications } from './constants';
import { ExtraContext } from '../types/layoutEditorTypes';
import { SelectRowsOptions } from '@labkey/api/dist/labkey/query/SelectRows';
import { labkeyActionSelectWithPromise } from '../api/labkeyActions';
import { cageModLookup } from '../api/popularQueries';
import { ConnectedCages, ConnectedRacks } from '../types/homeTypes';
import { Utils } from '@labkey/api';

export const zeroPadName = (num, places) => {return(String(num).padStart(places, '0'))};

export const generateCageId = (): CageSvgId => {
    return generateId('cageSVG-') as CageSvgId;
}

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
// roomForMods is passed if the unitsToRender is not room but needs access to the room object. This is for loading mods.
export const addPrevRoomSvgs = (mode: 'edit' | 'view', unitsToRender: Room | RackGroup | Rack | Cage, layoutSvg: d3.Selection<SVGElement, {}, HTMLElement, any>, modsToLoad?: RoomMods, setSelectedObj?, contextMenuRef?: MutableRefObject<Room>, setCtxMenuStyle?, closeMenuThenDrag?) => {
    let renderType: 'room' | 'group' | 'rack' | 'cage';

    if((unitsToRender as Room)?.rackGroups){
        renderType = 'room';
    } else if((unitsToRender as RackGroup)?.racks){ // we are rendering a single rack group
        renderType = 'group';
    }else if((unitsToRender as Rack)?.cages) { // we are rendering a single rack
        renderType = 'rack';
    }else{ // we are rendering a single cage
        renderType = 'cage';
    }

    // Loads modifications from constant styles and ids to inject into the svgs
    const loadCageMods = (cageToLoad: Cage, shape: d3.Selection<SVGElement, unknown, null, undefined>) => {
        if(!cageToLoad.mods) return;
        Object.entries(cageToLoad.mods).forEach(([loc,modSubList]) => {
            const modLoc = parseInt(loc) as ModLocations;
            modSubList.forEach((modList) => {
                const subId = modList.subId;
                modList.mods.forEach(modId => {
                    const currMod = modsToLoad[modId];
                    const modObj = Modifications[currMod.value];// find mod in mod constants array
                    // for each id in the location map the style if it exists
                    modObj.svgIds[modLoc].forEach((svgId, idx) => {
                        // If ids contain "-" they are split and searched left to right, helpful for listing parent-child ids
                        const svgIdSplit = svgId.split('-');
                        let currentSelection: d3.Selection<SVGElement, unknown, null, undefined> = shape.select(`[id=${svgIdSplit[0]}-${subId}]`);
                        for (let i = 1; i < svgIdSplit.length; i++) {
                            currentSelection = currentSelection.select(`#${svgIdSplit[i]}`)
                        }
                        modObj.styles.forEach((style) => {
                            changeStyleProperty(currentSelection.node() as SVGElement, style.property, style.value)
                        })
                    })
                })
            })
        })

    }

    // this function renders the actual visible svg in some groups
    const createRackGroup = (parentGroup, rack: Rack, isSingleRack) => {
        const rackTypeString: RackStringType = roomItemToString(rack.type.type) as RackStringType;

        const rackGroup = isSingleRack ? parentGroup : parentGroup.append('g')
            .attr('id', rack.itemId)
            .attr('class', `rack type-${rackTypeString}`)
            .attr('transform', `translate(${rack.x},${rack.y})`)
            .style('pointer-events', 'bounding-box');

        rack.cages.forEach(async (cage) => {
            const cageGroup = rackGroup.append('g')
                .attr('id', cage.id)
                .attr('transform', `translate(${cage.x},${cage.y})`);

            let unitSvg: SVGElement;
            // If we are editing we can simply copy the svg from the ones displayed.
            // If we are in view mode they aren't on the page so we must fetch and load them in
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
            // in order to set the event pass in the context menu ref and styles to show/hide it
            setupEditCageEvent( cageGroupContext, setSelectedObj, contextMenuRef,mode,setCtxMenuStyle);
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
        const cage: Cage = unitsToRender as Cage;
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

export const buildNewLocs = (prevRoomData: LayoutHistoryData[]): UnitLocations => {
    // Empty Unit locations object
    const newUnitLocs: UnitLocations = createEmptyUnitLoc();

    prevRoomData.forEach(roomItem => {
        if (!isRackEnum(roomItem.object_type)) {
            return;
        } // ignore room objects here
        let rackType: RoomItemStringType;
        if (isRackDefault(roomItem.object_type)) {
            rackType = roomItemToString(defaultTypeToRackType(roomItem.object_type));
        } else {
            rackType = roomItemToString(roomItem.object_type);
        }
        newUnitLocs[rackType].push({
            num: `${rackType}-${parseInt(roomItem.cage)}` as CageNumber,
            cellX: roomItem.x_coord,
            cellY: roomItem.y_coord
        });
    });
    return newUnitLocs;
};

export const buildNewLocalRoom = async (prevRoom: PrevRoom): Promise<Room> => {
    const newLocalRoom: Room = {
        name: prevRoom.name,
        rackGroups: [],
        objects: [],
        layoutData: null,
        mods: null
    };
    let newMods: RoomMods = {};
    let roomObjNum = 1;
    const loadMods: boolean = !!prevRoom.modData;
    //check if a group exists for the groupId, if it does return, else create new group for the room
    const findOrAddGroup = (rackItem: LayoutHistoryData): RackGroup => {
        // groupId is a single number so check if the GroupId string contains it
        let rackGroup: RackGroup = newLocalRoom.rackGroups.find(group => parseLongId(group.groupId) === rackItem.rack_group);
        if (!rackGroup) {
            //create new rack group if it doesn't exist
            rackGroup = {
                groupId: `rack-group-${rackItem.rack_group}` as GroupId,
                selectionType: 'rackGroup',
                scale: prevRoom.layoutData.scale,
                x: rackItem.x_coord,
                y: rackItem.y_coord,
                racks: []
            };
            newLocalRoom.rackGroups.push(rackGroup);
        }
        return rackGroup;
    };

    //check if a rack exists for the rackId, if it does return, else create new rack for the group
    const findOrAddRack = async (rackGroup: RackGroup, rackItem: LayoutHistoryData): Promise<Rack> => {
        const isDefault = isRackDefault(rackItem.object_type);
        let rackIdNum;
        let rowId;
        let extraContext: ExtraContext;
        let rackData;
        // if rack is default, use default rack id instead
        if (rackItem.extra_context) {
            extraContext = JSON.parse(rackItem.extra_context);
            if (extraContext?.rack?.rackId) {
                rackIdNum = extraContext.rack.rackId;
            }
        }

        if (!isDefault) {
            const optConfig: SelectRowsOptions = {
                schemaName: 'cageui',
                queryName: 'racks',
                filterArray: [
                    Filter.create('rowid', rackItem.rack, Filter.Types.EQUALS)
                ]
            };
            rackData = await labkeyActionSelectWithPromise(optConfig);
            if (rackData.rowCount > 0) {
                rackIdNum = rackData.rows[0].rackid;
                rowId = rackData.rows[0].rowid;
            }

        }

        let rack: Rack;
        if(rowId){
            rack = rackGroup.racks.find(r => rowId === r.rowid);
        }else {
            rack = rackGroup.racks.find(r => rackIdNum === r.itemId);
        }
        if (!rack) {
            //create new rack if it doesn't exist
            let type: UnitType;
            let rackId: DefaultRackId | RealRackId;
            let typeRowId;
            const rackPrefix = isDefault ? 'default-rack' : 'rack';

            if (!isDefault) {
                typeRowId = rackData.rows[0].rack_type;
                rackId = `${rackPrefix}-${rackIdNum}` as RealRackId;
            } else {
                rackId = `${rackPrefix}-${rackIdNum}` as DefaultRackId;
            }


            // if default get base type, else get rack type from rack id
            const optConfig = {
                schemaName: 'cageui',
                queryName: 'rack_types',
                filterArray: [
                    Filter.create(isDefault ? 'type' : 'rowid', isDefault ? rackItem.object_type : typeRowId, Filter.Types.EQUALS)
                ]
            };

            const rackTypesData = await labkeyActionSelectWithPromise(optConfig);
            if(rackTypesData.rowCount === 0){
                return;
            }
            const svgSize = await getSvgSize(rackTypesData.rows[0].type);
            // determine sizes for sides, (how many different lines make a side in an svg that could each have their own mods)
            // my current ratio is 4 meaning a square of 4x4 cells will have one section.
            type = {
                rowid: typeRowId as number,
                name: rackTypesData.rows[0].name as string,
                type: (isDefault ? defaultTypeToRackType(rackTypesData.rows[0].type) : rackTypesData.rows[0].type) as RackTypes,
                isDefault: isDefault,
                sides: isDefault ? undefined : {
                    [ModLocations.Top]: {
                        sections: svgSize / 4,
                    },
                    [ModLocations.Bottom]: {
                        sections: svgSize / 4
                    },
                    [ModLocations.Left]: {
                        sections: svgSize / 4
                    },
                    [ModLocations.Right]: {
                        sections: svgSize / 4
                    },
                    [ModLocations.Direct]: {
                        sections: 1
                    }
                }
            };

            rack = {
                rowid: rowId,
                selectionType: 'rack',
                cages: [],
                isActive: !isDefault,
                itemId: rackId,
                type: type,
                x: rackItem.x_coord - rackGroup.x, // subtract group coords from layout coords to get rack coords
                y: rackItem.y_coord - rackGroup.y,
                extraContext: extraContext?.rack
            };
            rackGroup.racks.push(rack);
        }
        return rack;
    };

    const addCageToRack = async (rack: Rack, rackItem: LayoutHistoryData, group: RackGroup) => {
        // only string for RackTypes, not DefaultRackTypes, since cageNum is used for location tracking which uses RackTypes
        let cageNumType: RoomItemStringType;
        let extraContext: ExtraContext;
        let cageNum = parseInt(rackItem.cage);


        let cageMods: CageModificationsType = {
            [ModLocations.Top]: [],
            [ModLocations.Bottom]: [],
            [ModLocations.Left]: [],
            [ModLocations.Right]: [],
            [ModLocations.Direct]: []
        };
        if (rack.type.isDefault) {
            cageNumType = roomItemToString(defaultTypeToRackType(rackItem.object_type as DefaultRackTypes));
        } else {
            cageNumType = roomItemToString(rackItem.object_type);
        }
        if (rackItem.extra_context) {
            extraContext = JSON.parse(rackItem.extra_context);
        }
        const svgSize = await getSvgSize(rack.type.type);

        //TODO Add mods if needed here
        if (loadMods && !rack.type.isDefault) {

            const modReturnData = await cageModLookup([],[]);
            const availMods = modReturnData.map(row => ({value: row.value, label: row.title}));

            const prevMods = prevRoom.modData.filter((mod) => mod.rack === rack.rowid && mod.cage === cageNum);
            prevMods.forEach((mod) => {
                // If Mod id exists in newMods we can skip adding it to newMods
                if(!Object.keys(newMods).find(key => key === mod.modId)){
                    newMods[mod.modId] = availMods.find(am => am.value === mod.modification);
                }
                // if subId already exists add the mod to that subsection
                if(cageMods[mod.location].find(m => m.subId === mod.subId)){
                    cageMods[mod.location] = cageMods[mod.location].map(mods => {
                        if(mods.subId === mod.subId){
                            return {
                                ...mods,
                                mods: [...mods.mods, mod.modId]
                            }
                        }
                    });
                }else{
                    cageMods[mod.location] = [...cageMods[mod.location], {subId: mod.subId, mods: [mod.modId]}];
                }
            })
        }
        const cage: Cage = {
            id: generateCageId(),
            cageNum: `${cageNumType}-${cageNum}` as CageNumber,
            extraContext: extraContext?.cage,
            selectionType: 'cage',
            localRackId: rack.cages.length + 1,
            x: rackItem.x_coord - rack.x - group.x, // get cage coords by subtracting from both rack and group
            y: rackItem.y_coord - rack.y - group.y,
            size: svgSize,
            mods: cageMods
        };
        rack.cages.push(cage);
    };

    const handleRackItem = async (rackItem: LayoutHistoryData) => {
        const rackGroup: RackGroup = findOrAddGroup(rackItem);
        const rack: Rack = await findOrAddRack(rackGroup, rackItem);
        await addCageToRack(rack, rackItem, rackGroup);
    };

    // generates room object state for room objects from layout history data
    const generateRoomObj = (roomObjItem: LayoutHistoryData): RoomObject => {
        let context;
        if (roomObjItem.extra_context) {
            context = JSON.parse(roomObjItem.extra_context);
        }
        return ({
            itemId: `${roomItemToString(roomObjItem.object_type)}-${roomObjNum++}`, // update room obj num after it is used to next num
            type: roomObjItem.object_type as RoomObjectTypes,
            selectionType: 'obj',
            x: roomObjItem.x_coord,
            y: roomObjItem.y_coord,
            scale: prevRoom.layoutData.scale,
            extraContext: context
        });
    };

    for (const roomItem of prevRoom.cagingData) {
        if (isRackEnum(roomItem.object_type)) { // Room item is an enclosure for animals
            await handleRackItem(roomItem);
        } else { // Room item is something else in the room, ex. Door
            newLocalRoom.objects.push(generateRoomObj(roomItem));
        }
    }
    newLocalRoom.mods = newMods;
    return (newLocalRoom);
}

// Sadly we kind of have to hard code this function.
export const getAdjLocation = (loc: ModLocations): ModLocations => {
    switch (loc) {
        case ModLocations.Left:
            return ModLocations.Right;
        case ModLocations.Right:
            return ModLocations.Left;
        case ModLocations.Top:
            return ModLocations.Bottom;
        case ModLocations.Bottom:
            return ModLocations.Top;
        default:
            return ModLocations.Direct;
    }
}

export const getDefaultMod = (loc: ModLocations): ModTypes | null => {
    if(loc === ModLocations.Top || loc === ModLocations.Bottom){
        return ModTypes.StandardFloor;
    }
    if(loc === ModLocations.Left || loc === ModLocations.Right){
        return ModTypes.SolidDivider;
    }
    return null;
}

function getGlobalPosition(box: Cage, rack: Rack, group?: RackGroup): { x: number; y: number } {
    // Calculate the global position of the box
    let x;
    let y;
    if(group){
        x = group.x + rack.x + box.x;
        y = group.y + rack.y + box.y;
    }else{
        x = rack.x + box.x;
        y = rack.y + box.y;
    }
    return {
        x: x,
        y: y,
    };
}

// Helper: robust float comparison
const EPS = 0.0001;

// Helper: clamp intersection range along one axis
function getOverlapRange(aStart: number, aEnd: number, bStart: number, bEnd: number): { start: number; end: number } | null {
    const start = Math.max(aStart, bStart);
    const end = Math.min(aEnd, bEnd);
    return end - start > EPS ? { start, end } : null;
}

// Helper: compute which segment indices intersect an overlap range.
// sideLenPx: total length in px of the side (height for left/right; width for top/bottom)
// numSections: number of polyline segments on that side (from UnitType.sides[side].sections)
// localStartPx/localEndPx: overlap range relative to the cage's local side start (0..sideLenPx)
function getIntersectingSectionIndices(
    sideLenPx: number,
    numSections: number,
    localStartPx: number,
    localEndPx: number
): number[] {
    if (numSections <= 0) return [];
    if (sideLenPx <= 0) return [];

    const segLen = sideLenPx / numSections;
    const indices: number[] = [];

    // Find first and last segments that have any overlap with [localStartPx, localEndPx]
    // We expand slightly by EPS to avoid precision misses on boundaries.
    const firstIdx = Math.max(0, Math.floor((localStartPx - EPS) / segLen));
    const lastIdx = Math.min(numSections - 1, Math.floor((localEndPx - EPS) / segLen));

    for (let i = firstIdx; i <= lastIdx; i++) {
        const segStart = i * segLen;
        const segEnd = segStart + segLen;
        if (segEnd > localStartPx + EPS && segStart < localEndPx - EPS) {
            indices.push(i);
        }
    }
    return indices;
}

// Helper: build side-id strings (e.g., "left-2") from indices (0-based -> 1-based)
function buildSideIds(sideName: 'left' | 'right' | 'top' | 'bottom', indices: number[]): string[] {
    // ensure unique & sorted
    const uniqSorted = Array.from(new Set(indices)).sort((a, b) => a - b);
    return uniqSorted.map(i => `${sideName}-${i + 1}`);
}

function areAdjacent(
    currCage: Cage,
    currRack: Rack,
    adjCage: Cage,
    adjRack: Rack,
    group?: RackGroup
): {
    location: ModLocations | null,
    currLines: string[],
    adjLines: string[]
} {
    const cellSize = CELL_SIZE;

    // Global positions (top-left of each cage in px)
    const currGlobalPos = getGlobalPosition(currCage, currRack, group);
    const adjGlobalPos = getGlobalPosition(adjCage, adjRack, group);

    // Cages are squares of size "cage.size" cells
    const width1 = currCage.size * cellSize;
    const height1 = width1;

    const width2 = adjCage.size * cellSize;
    const height2 = width2;

    // Box edges
    const left1 = currGlobalPos.x;
    const right1 = currGlobalPos.x + width1;
    const top1 = currGlobalPos.y;
    const bottom1 = currGlobalPos.y + height1;

    const left2 = adjGlobalPos.x;
    const right2 = adjGlobalPos.x + width2;
    const top2 = adjGlobalPos.y;
    const bottom2 = adjGlobalPos.y + height2;

    // Section counts per side from UnitType
    const currSides = currCage.size / 4;
    const adjSides = adjCage.size / 4;

    // Early guard
    if (!currSides || !adjSides) {
        return { location: null, currLines: [], adjLines: [] };
    }

    // Horizontal adjacency: adj is directly to the left of curr (their vertical spans overlap)
    if (Math.abs(left1 - right2) < EPS) {
        const yOverlap = getOverlapRange(top1, bottom1, top2, bottom2);
        if (yOverlap) {
            const overlapStartY = yOverlap.start;
            const overlapEndY = yOverlap.end;

            // Map overlap to local coordinates on each cage side (along vertical)
            const currLocalStart = overlapStartY - top1;
            const currLocalEnd = overlapEndY - top1;
            const adjLocalStart = overlapStartY - top2;
            const adjLocalEnd = overlapEndY - top2;

            const currIdx = getIntersectingSectionIndices(height1, currSides, currLocalStart, currLocalEnd);
            const adjIdx = getIntersectingSectionIndices(height2, adjSides, adjLocalStart, adjLocalEnd);

            return {
                location: ModLocations.Left,
                currLines: buildSideIds('left', currIdx),
                adjLines: buildSideIds('right', adjIdx)
            };
        }
    }

    // Horizontal adjacency: adj is directly to the right of curr
    if (Math.abs(right1 - left2) < EPS) {
        const yOverlap = getOverlapRange(top1, bottom1, top2, bottom2);
        if (yOverlap) {
            const overlapStartY = yOverlap.start;
            const overlapEndY = yOverlap.end;

            const currLocalStart = overlapStartY - top1;
            const currLocalEnd = overlapEndY - top1;
            const adjLocalStart = overlapStartY - top2;
            const adjLocalEnd = overlapEndY - top2;

            const currIdx = getIntersectingSectionIndices(height1, currSides, currLocalStart, currLocalEnd);
            const adjIdx = getIntersectingSectionIndices(height2, adjSides, adjLocalStart, adjLocalEnd);

            return {
                location: ModLocations.Right,
                currLines: buildSideIds('right', currIdx),
                adjLines: buildSideIds('left', adjIdx)
            };
        }
    }

    // Vertical adjacency: adj is directly above curr
    if (Math.abs(top1 - bottom2) < EPS) {
        const xOverlap = getOverlapRange(left1, right1, left2, right2);
        if (xOverlap) {
            const overlapStartX = xOverlap.start;
            const overlapEndX = xOverlap.end;

            // Map overlap to local coordinates on each cage side (along horizontal)
            const currLocalStart = overlapStartX - left1;
            const currLocalEnd = overlapEndX - left1;
            const adjLocalStart = overlapStartX - left2;
            const adjLocalEnd = overlapEndX - left2;

            const currIdx = getIntersectingSectionIndices(width1, currSides, currLocalStart, currLocalEnd);
            const adjIdx = getIntersectingSectionIndices(width2, adjSides, adjLocalStart, adjLocalEnd);

            return {
                location: ModLocations.Top,
                currLines: buildSideIds('top', currIdx),
                adjLines: buildSideIds('bottom', adjIdx)
            };
        }
    }

    // Vertical adjacency: adj is directly below curr
    if (Math.abs(bottom1 - top2) < EPS) {
        const xOverlap = getOverlapRange(left1, right1, left2, right2);
        if (xOverlap) {
            const overlapStartX = xOverlap.start;
            const overlapEndX = xOverlap.end;

            const currLocalStart = overlapStartX - left1;
            const currLocalEnd = overlapEndX - left1;
            const adjLocalStart = overlapStartX - left2;
            const adjLocalEnd = overlapEndX - left2;

            const currIdx = getIntersectingSectionIndices(width1, currSides, currLocalStart, currLocalEnd);
            const adjIdx = getIntersectingSectionIndices(width2, adjSides, adjLocalStart, adjLocalEnd);

            return {
                location: ModLocations.Bottom,
                currLines: buildSideIds('bottom', currIdx),
                adjLines: buildSideIds('top', adjIdx)
            };
        }
    }

    // Not adjacent
    return {
        location: null,
        currLines: [],
        adjLines: []
    };
}

// Finds the cage connections in a rack.
//
// If cage is passed then it only finds the connections with that cage.
export const findConnectedCages = (rack: Rack, cage?: Cage) => {

    const connections: ConnectedCages = {[ModLocations.Top]: [], [ModLocations.Bottom]: [], [ModLocations.Right]: [], [ModLocations.Left]: [], [ModLocations.Direct]: []};
    if(cage){
        for (let i = 0; i < rack.cages.length; i++) {
            if(rack.cages[i].cageNum !== cage.cageNum){
                const adj = areAdjacent(cage, rack, rack.cages[i], rack);
                if (adj.location !== null) {
                    adj.currLines.forEach(((line,idx) => {
                        const currSubId = parseInt(line.split('-')[1]);
                        const adjSubId = parseInt(adj.adjLines[idx].split('-')[1]);
                        connections[adj.location].push({
                            currSubId: currSubId,
                            adjSubId: adjSubId,
                            currCage: cage,
                            adjCage: rack.cages[i]
                        });
                    }))
                }
            }
        }
    }else{
        for (let i = 0; i < rack.cages.length; i++) {
            for (let j = i + 1; j < rack.cages.length; j++) {
                const adj = areAdjacent(rack.cages[i], rack, rack.cages[j], rack);
                if (adj.location !== null) {
                    adj.currLines.forEach((line,idx) => {
                        const currSubId = parseInt(line.split('-')[1]);
                        const adjSubId = parseInt(adj.adjLines[idx].split('-')[1]);
                        connections[adj.location].push({
                            currSubId: currSubId,
                            adjSubId: adjSubId,
                            currCage: rack.cages[i],
                            adjCage: rack.cages[j]
                        });
                    });
                }
            }
        }
    }


    return connections;
}

// This can be done by "guessing" the what other cage coords would be if they were adjacent, if they dont exist then they are not
// If cage is passed then it will only include connections with that cage
export const findConnectedRacks = (group: RackGroup, currRack: Rack, cage?: Cage) => {
    const connections: ConnectedRacks = {[ModLocations.Top]: [], [ModLocations.Bottom]: [], [ModLocations.Right]: [], [ModLocations.Left]: [], [ModLocations.Direct]: []};

    const areRacksConnected = (cRack: Rack, adjRack: Rack) => {
        for (const currCage of cRack.cages) {
            let subId = 1;
            for (const adjCage of adjRack.cages) {

                // If cage is passed then determine if either cage is included and skip if not.
                if(cage){
                    if(cage.cageNum !== currCage.cageNum && cage.cageNum !== adjCage.cageNum){
                        continue;
                    }
                }

                const adj = areAdjacent(currCage, cRack, adjCage, adjRack, group);
                // skip racks that arent connected to the current rack
                if(cRack.rowid !== currRack.rowid && adjRack.rowid !== currRack.rowid){
                    continue;
                }
                if(adj.location !== null){
                    //[[rack1,cage1], adj, [rack2,cage2]]
                    adj.currLines.forEach((line,idx) => {
                        const currSubId = parseInt(line.split('-')[1]);
                        const adjSubId = parseInt(adj.adjLines[idx].split('-')[1]);
                        connections[adj.location].push({
                            currSubId: currSubId,
                            adjSubId: adjSubId,
                            currRack: cRack,
                            currCage: currCage,
                            adjRack: adjRack,
                            adjCage: adjCage,
                        });
                    });
                }
            }
        }
    }

    for (let i = 0; i < group.racks.length; i++) {
        if(group.racks[i].rowid !== currRack.rowid){
            areRacksConnected(currRack, group.racks[i]);
        }
    }
    console.log(`XXX Rack: ${currRack}`, connections)
    return connections;
}
