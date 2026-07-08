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
import * as d3 from 'd3';
import { zoomTransform } from 'd3';
import { MutableRefObject } from 'react';
import { ActionURL, Filter, Query, Security, Utils } from '@labkey/api';
import { selectDistinctRows } from '@labkey/components';

import {
    AllHistoryData,
    Cage,
    CageDirection,
    CageModification,
    CageModificationsType,
    CageMods,
    CageNumber,
    CageSvgId,
    DefaultRackStringType,
    DefaultRackTypes,
    FetchRoomData,
    FullCageHistory,
    FullObjectHistoryData,
    GhostCageData,
    GroupId,
    GroupRotation,
    LayoutData,
    LayoutHistoryData,
    LoadedSvgs,
    ModData,
    ModLocations,
    ModTypes,
    PrevRoom,
    Rack,
    RackConditionOption,
    RackConditions,
    RackData,
    RackGroup,
    RackStringType,
    RackTypes,
    Room,
    RoomItemStringType,
    RoomItemType,
    RoomMods,
    RoomObject,
    RoomObjectStringType,
    RoomObjectTypes,
    SessionLog,
    TemplateHistoryData,
    UnitLocations,
    UnitType
} from '../types/typings';
import {
    addModEntries,
    areAllRacksNonDefault,
    canOpenContextMenu,
    createEmptyUnitLoc,
    findCageInGroup,
    isDraggable,
    isRackEnum,
    isRoomHomogeneousDefault,
    placeAndScaleGroup,
    processRealLayoutHistory,
    setupEditCageEvent
} from './LayoutEditorHelpers';
import { CELL_SIZE, Modifications, roomSizeOptions, SVG_HEIGHT, SVG_WIDTH } from './constants';
import { ExtraContext, LayoutSaveResult } from '../types/layoutEditorTypes';
import { labkeyActionSelectWithPromise, saveRoomLayout } from '../api/labkeyActions';
import { cageModLookup } from '../api/popularQueries';
import { ConnectedCages, ConnectedRacks } from '../types/homeTypes';


export const zeroPadName = (num, places) => {
    return(String(num).padStart(places, '0'));
};

export const isTemplateCreator = (user: Security.GetUserPermissionsResponse) => {
    return Security.hasEffectivePermission(user.container.effectivePermissions, 'org.labkey.cageui.security.permissions.CageUITemplateCreatorPermission');
};

export const isRoomCreator = (user: Security.GetUserPermissionsResponse) => {
    return Security.hasEffectivePermission(user.container.effectivePermissions, 'org.labkey.cageui.security.permissions.CageUIRoomCreatorPermission');
};

export const isRoomModifier = (user: Security.GetUserPermissionsResponse) => {
    return Security.hasEffectivePermission(user.container.effectivePermissions, 'org.labkey.cageui.security.permissions.CageUIRoomModifierPermission');
};

export const isCageModifier = (user: Security.GetUserPermissionsResponse) => {
    return Security.hasEffectivePermission(user.container.effectivePermissions, 'org.labkey.cageui.security.permissions.CageUIModificationEditorPermission');
};

// Converts JS date object to labkey java friendly date object so it can be mapped properly from JS -> Java
export const toLabKeyDate = (date: Date): string => {
    const pad = (n: number, cnt: number) => n.toString().padStart(cnt, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1,2)}-${pad(date.getDate(), 2)} ` +
        `${pad(date.getHours(),2)}:${pad(date.getMinutes(),2)}:${pad(date.getSeconds(),2)}.${pad(date.getMilliseconds(),3)}`;
}

export const generateCageId = (objectId: string): CageSvgId => {

    return `cageSVG_${objectId}` as CageSvgId;
};

export const generateUUID = (): string => {
    return Utils.generateUUID().toUpperCase();
}

// Changes stroke color of svg element nodes keeping the other styles.
export const changeStyleProperty = (element: Element, property: string, newValue: string): void => {
    const styleAttr = element.getAttribute('style');
    if (styleAttr) {
        const styles = styleAttr.split(';').map(style => style.trim()).filter(style => style !== '');
        let updated = false;
        const updatedStyles = styles.map(style => {
            const [prop, value] = style.split(':').map(prop => prop.trim()).filter(prop => prop !== '');
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
};

export const getSvgSize = async (type: RackTypes) => {
    const config: Query.SelectDistinctOptions = {
        schemaName: 'ehr_lookups',
        queryName: 'cageui_item_types',
        column: 'description',
        filterArray: [Filter.create('value', type, Filter.Types.EQUAL)]
    };

    const res = await selectDistinctRows(config);

    if (res.values.length === 1) {
        return res.values[0];
    }

    return;
};

// matches "string-number", if a match return the number
export const parseRoomItemNum = (input: string): number => {
    const regex = /\w+-(\d+)/;

    const match = input.match(regex);
    if (match) {
        return parseInt(match[1]);
    }
    return;
};

// matches "string-number", if a match return the type/string
export const parseRoomItemType = (input: string): string => {
    const regex = /^(\w+)-\d+$/;

    const match = input.match(regex);
    if (match) {
        return match[1];
    }
    return;
};

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
};


export const parseLongId = (input: string) => {
    const regex = /\w+-\w+-(\d+)/; // matches "string-string-number"

    const match = input.match(regex);
    if (match) { // if a match return the number
        return parseInt(match[1]);
    }
    return;
};

export const formatRoomObj = (input: string): string => {
    // Handle the special cases with any digit after hyphen
    if (input.startsWith("gateClosed-") || input.startsWith("gateOpen-")) {
        return "Gate";
}
    // Remove the "-{digit}" suffix if present
    let cleanString = input.replace(/-\d+$/, '');

    // Handle empty string
    if (!cleanString) return '';

    // Split on uppercase letters and hyphens, then filter out empty strings
    const parts = cleanString.split(/(?=[A-Z])|[-_]/).filter(part => part.length > 0);

    // Capitalize first letter of each part and make the rest lowercase
    return parts
        .map(part => {
            if (part.length === 0) return '';
            return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
        })
        .join(' ');
}

export const formatCageNum = (str: string) => {
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


};

export const getNextDefaultRackId = (groups: RackGroup[]): number => {
    // Extract & parse only "default-rack-*" IDs
    const allRackNumbers = groups
        .flatMap(group =>
            group.racks
                .map(rack => rack.type.isDefault ? rack.itemId : 0)
                .filter(num => num > 0) // Only keep valid default-rack numbers
        )
        .sort((a, b) => a - b); // Sort ascending

    // Find the first missing number (starting from 1)
    let expectedNumber = 1;
    for (const num of allRackNumbers) {
        if (num > expectedNumber) {
            // Gap found! Use the missing number
            return expectedNumber;
        }
        expectedNumber = num + 1;
    }

    // No gaps? Use the next number after the max
    return expectedNumber;
};
export const convertToTitleCase = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

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

    return {rackTypeToDefaultTypeMap, defaultTypeToRackTypeMap};
};

// These two maps can be imported and used to convert between the string and number of the rack type enum
const {rackTypeToDefaultTypeMap, defaultTypeToRackTypeMap} = generateTypeMaps();

export const rackTypeToDefaultType = (type: RackTypes) => {
    return rackTypeToDefaultTypeMap[type];
};

export const defaultTypeToRackType = (type: DefaultRackTypes) => {
    return defaultTypeToRackTypeMap[type];
};

/*
   parse a room iteam to a string
 */
export const roomItemToString = (item: RoomItemType): RoomItemStringType => {
    let itemString: RoomItemStringType;
    // Uppercase the first letter of the string
    const rackString = RackTypes[item];
    const roomObjString = RoomObjectTypes[item];
    const defaultRackString = DefaultRackTypes[item];

    if (rackString) {
        itemString = rackString.charAt(0).toLowerCase() + rackString.slice(1) as RackStringType;
    } else if (defaultRackString) {
        itemString = defaultRackString.charAt(0).toLowerCase() + defaultRackString.slice(1) as DefaultRackStringType;

    } else {
        itemString = roomObjString.charAt(0).toLowerCase() + roomObjString.slice(1) as RoomObjectStringType;
    }
    return itemString;
};

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
};

export const fetchRoomData = async (roomName: string, abortSignal?: AbortSignal): Promise<FetchRoomData> => {
    const prevRoomData: FetchRoomData = {
        prevRoomData: undefined,
        selectedSize: undefined,
        showSelectionPopup: false,
        error: undefined
    };

    // Make call to all_history for room and determine if template or not.
    const allHistoryCfg: Query.SelectRowsOptions = {
        schemaName: 'cageui',
        queryName: 'all_history',
        columns: [],
        filterArray: [
            Filter.create('room', roomName, Filter.Types.EQUALS),
            Filter.create('end_date', null, Filter.Types.ISBLANK)
        ]
    };

    const allHistRes = await labkeyActionSelectWithPromise(allHistoryCfg, abortSignal);

    if (allHistRes.rowCount === 1) {
        const allHistObj: AllHistoryData = {
            endDate: allHistRes.rows[0].end_date,
            historyId: allHistRes.rows[0].historyid,
            historyType: allHistRes.rows[0].history_type,
            room: allHistRes.rows[0].room,
            rowid: allHistRes.rows[0].rowid,
            startDate: allHistRes.rows[0].start_date,
            valid: allHistRes.rows[0].valid
        };

        let historyTable: string = allHistObj.historyType === 'template' ? 'template_layout_history' : 'layout_history';
        const isDefaultRoom: boolean = allHistObj.historyType === 'template';

        const prevRoomConfig: Query.SelectRowsOptions = {
            schemaName: 'cageui',
            queryName: historyTable,
            columns: [],
            filterArray: [
                Filter.create('historyid', allHistObj.historyId, Filter.Types.EQUALS),
                Filter.create('end_date', null, Filter.Types.ISBLANK)
            ]
        };

        const prevRoomBorderConfig: Query.SelectRowsOptions = {
            schemaName: 'cageui',
            queryName: 'room_history',
            columns: ['scale', 'border_width', 'border_height'],
            filterArray: [
                Filter.create('historyid', allHistObj.historyId, Filter.Types.EQUALS)
            ]
        };

        const modHistoryConfig = {
            schemaName: 'cageui',
            queryName: 'cage_modifications_history',
            columns: [],
            filterArray: [
                Filter.create('historyid', allHistObj.historyId, Filter.Types.EQUALS),
            ]
        };

        const [prevRoomResult, borderResult, modResult] = await Promise.all([
            labkeyActionSelectWithPromise(prevRoomConfig, abortSignal),
            labkeyActionSelectWithPromise(prevRoomBorderConfig, abortSignal),
            labkeyActionSelectWithPromise(modHistoryConfig, abortSignal)
        ]);

        let borderObj: LayoutData;
        let cagingData: FullObjectHistoryData[] = [];
        let modData: ModData[];

        if (borderResult.rowCount === 0) {
            throw new Error(`No room found in EHR for ${roomName}`);
        } else {
            borderObj = {
                scale: borderResult.rows[0].scale || 1,
                borderHeight: borderResult.rows[0].border_height || SVG_HEIGHT - 1,
                borderWidth: borderResult.rows[0].border_width || SVG_WIDTH - 1,
            };
            prevRoomData.selectedSize = roomSizeOptions.find(opt => opt.scale === borderObj.scale);
            prevRoomData.showSelectionPopup = false;
        }

        if (prevRoomResult.rowCount > 0) {
            if (isDefaultRoom) {
                cagingData = prevRoomResult.rows.map((row: TemplateHistoryData) => ({
                    objectType: row.object_type,
                    extraContext: row.extra_context,
                    rackGroup: row.rack_group,
                    groupRotation: row.group_rotation,
                    rack: row.rack,
                    cage: row.cage,
                    xCoord: row.x_coord,
                    yCoord: row.y_coord,
                }));
            } else {
                const layoutHistoryData: LayoutHistoryData[] = prevRoomResult.rows.map(row => ({
                    historyId: row.historyid,
                    cage: row.cage,
                    objectType: row.object_type,
                    extraContext: row.extra_context,
                    xCoord: row.x_coord,
                    yCoord: row.y_coord,
                    rowid: row.rowid,
                }));

                const layoutHistoryResults = await processRealLayoutHistory(layoutHistoryData);

                if (layoutHistoryResults.rejected.length > 0) {
                    throw new Error(`Error processing layout history for ${roomName}: \n ${layoutHistoryResults.rejected.join(`\n`)}`);
                } else {
                    cagingData = layoutHistoryResults.fulfilled;
                }
            }
        }

        if (modResult.rowCount > 0) {
            modData = modResult.rows.map(row => ({
                location: row.location,
                modId: row.modid,
                parentModId: row.parent_modid,
                subId: row.subid,
                cage: row.cage,
                modification: row.modification,
                historyId: row.historyid
            }));
        }

        prevRoomData.prevRoomData = {
            name: roomName,
            cagingData: cagingData,
            layoutData: borderObj,
            isDefault: isDefaultRoom,
            modData: modData
        };

        return prevRoomData;
    }
    return prevRoomData;
};

const loadSvgs = async (): Promise<LoadedSvgs> => {
    const loadedSvgs: LoadedSvgs = {};

    const config: Query.SelectRowsOptions = {
        schemaName: "ehr_lookups",
        queryName: "cageui_svg_urls",
        columns: ["value", "title"]
    }

    const res = await labkeyActionSelectWithPromise(config);
    if(res.rowCount > 0){

        // Create all promises first
        const promises = res.rows.map(row => {
            return d3.svg(`${ActionURL.getContextPath()}${row.title}`).then((d) => {
                if(!loadedSvgs[row.value]){ // cage templates
                    loadedSvgs[row.value] = d.querySelector(`svg[id*=template]`);
                }
                if(!loadedSvgs[row.value]){ // room objects
                    loadedSvgs[row.value] = d.querySelector('svg');
                }
            });
        });

        // Wait for all promises to complete
        await Promise.all(promises);
    }else{
        console.error("Error finding cageUI Svgs")
    }

    return loadedSvgs;
}


// Adds the svgs from the saved layouts to the DOM. Mode edit is version displayed in the layout editor and view is the one in the home views.
// roomForMods is passed if the unitsToRender is not room but needs access to the room object. This is for loading mods.
export const addPrevRoomSvgs = async (
    user: Security.GetUserPermissionsResponse,
    mode: 'edit' | 'view',
    unitsToRender: Room | RackGroup | Rack | Cage,
    layoutSvg: d3.Selection<SVGElement, {}, HTMLElement, any>,
    currRoom?: Room, modsToLoad?: RoomMods, setSelectedObj?,
    contextMenuRef?: MutableRefObject<Room>,
    setCtxMenuStyle?,
    closeMenuThenDrag?,
    isCancelled?: () => boolean) => {
    let renderType: 'room' | 'group' | 'rack' | 'cage';
    const loadedSvgs: LoadedSvgs = await loadSvgs();

    if (isCancelled && isCancelled()) {
        return;
    }

    if ((unitsToRender as Room)?.rackGroups) {
        renderType = 'room';
    } else if ((unitsToRender as RackGroup)?.racks) { // we are rendering a single rack group
        renderType = 'group';
    } else if ((unitsToRender as Rack)?.cages) { // we are rendering a single rack
        renderType = 'rack';
    } else { // we are rendering a single cage
        renderType = 'cage';
    }

    // Loads modifications from constant styles and ids to inject into the svgs
    const loadCageMods = (cageToLoad: Cage, shape: d3.Selection<SVGElement, unknown, null, undefined>, rotation: GroupRotation) => {
        if (!cageToLoad.mods) {
            return;
        }

        Object.entries(cageToLoad.mods).forEach(([loc, modSubList]: [string, CageModification[]]) => {
            const modLoc = parseInt(loc) as ModLocations;
            modSubList.forEach((modList) => {
                const subId = modList.subId;
                modList.modKeys.forEach(modMap => {
                    const currMod = modsToLoad[modMap.modId];
                    const modObj = Modifications[currMod.value];// find mod in mod constants array
                    // for each id in the location map the style if it exists
                    modObj.svgIds[modLoc][rotation].forEach((svgId, idx) => {
                        // If ids contain "-" they are split and searched left to right, helpful for listing parent-child ids
                        const svgIdSplit = svgId.split('-');
                        let currentSelection: d3.Selection<SVGElement, unknown, null, undefined> = shape.select(`[id=${svgIdSplit[0]}-${subId}]`);
                        for (let i = 1; i < svgIdSplit.length; i++) {
                            currentSelection = currentSelection.select(`#${svgIdSplit[i]}`);
                        }
                        modObj.styles.forEach((style) => {
                            changeStyleProperty(currentSelection.node() as SVGElement, style.property, style.value);
                        });
                    });
                });
            });
        });
    };

    /*
        This function creates a container for the selected animal ID and returns it to be appended to the cage element.
     */
    const createAnimalContainer = (id: string, shape: d3.Selection<SVGElement, unknown, null, undefined>, idIdx: number) => {
        const factor = 20;
        // Create the SVG group element
        const group = shape.append("g")
            .attr("id", `animal-id-${id}`)

        // Add the rectangle
        group.append("rect")
            .attr("id", "animal-id-container")
            .attr("x", "3")
            .attr("y", `${3 + (idIdx * factor)}`)
            .attr("width", `${id.length * 6.8}`)
            .attr("height", "16.23")
            .attr("rx", "2.44")
            .attr("ry", "2.44")
            .style("fill", "#c5050c")
            .style("stroke", "#c5050c")
            .style("stroke-miterlimit", "10");

        // Add the text element
        group.append("text")
            .attr("id", "animal-id")
            .attr("transform", `translate(6.94 ${15.29 + (idIdx * factor)})`)
            .style("fill", "#fff")
            .style("font-family", "MyriadPro-Regular, 'Myriad Pro'")
            .style("font-size", "12px")
            .append("tspan")
            .attr("x", "0")
            .attr("y", "0")
            .text(id);
    }

    // this function renders the actual visible svg in some groups
    const createRackGroup = (parentGroup, rack: Rack, isSingleRack, groupRotation: GroupRotation) => {
        const rackTypeString: RackStringType = roomItemToString(rack.type.type) as RackStringType;
        // Ghost racks have 0 item id
        const isGhostRack = rack.itemId === 0;

        const rackGroup = isSingleRack ? parentGroup : parentGroup.append('g')
            .attr('id', rack.svgId)
            .attr('class', `rack type-${rackTypeString}`)
            .attr('transform', `translate(${rack.x},${rack.y})`)
            .style('pointer-events', 'bounding-box');

        // This is where the cage svg group is created.
        rack.cages.forEach((cage) => {
            const cageGroup = rackGroup.append('g')
                .attr('id', cage.svgId)
                .attr('name', cage.cageNum)
                .attr('transform', `translate(${cage.x},${cage.y})`);

            const unitSvg: SVGElement = loadedSvgs[rackTypeString].cloneNode(true) as SVGElement;

            // Only needed for layout editor to attach context menus
            const shape = d3.select(unitSvg);
            shape.classed('draggable', false);
            shape.style('pointer-events', 'none');

            if(!isGhostRack){
                (shape.select('tspan').node() as SVGTSpanElement).textContent = `${parseRoomItemNum(cage.cageNum)}`;
            }

            if (mode === 'view') {
                loadCageMods(cage, shape, groupRotation);
                if(isGhostRack){
                    shape.select('[id=cageRect]')
                        .style("fill", '#878787')
                        .style("opacity", '0.7');
                }
                if(cage.animals){
                    if(cage.animals.length > 3){
                        // If animals in cage is more than 4 display a count of the animals in the cage
                        createAnimalContainer(`${cage.animals.length} animals`, shape, 0)
                    }else{
                        // Display animal ids if count is less than 4
                        cage.animals.forEach((animal, idx) => {
                            createAnimalContainer(animal.id, shape, idx)
                        })
                    }
                }
            }

            cageGroup.append(() => shape.node());
            // Dont attach menus to ghost racks
            if(!isGhostRack){
                // attach context menu if user has permissions for cages
                if(canOpenContextMenu(user, rack.type.type)){
                    // in order to set the event pass in the context menu ref and styles to show/hide it
                    setupEditCageEvent(cageGroup.node(), setSelectedObj, contextMenuRef, mode, setCtxMenuStyle);
                }
            }

        });

        return rackGroup;
    };

    const createGroup = (group: RackGroup) => {
        const isSingleRack = group.racks.length === 1;
        const parentGroup = isSingleRack
            ? layoutSvg.append('g')
                .attr('id', group.racks[0].svgId)
                .attr('class', `draggable rack type-${roomItemToString(group.racks[0].type.type)}`)
                .style('pointer-events', 'bounding-box')
            : layoutSvg.append('g')
                .attr('id', group.groupId)
                .attr('class', 'draggable rack-group');

        group.racks.forEach( rack => {
            // Use parent group as rackGroup if only 1 rack, otherwise create a new rack group
            createRackGroup(parentGroup, rack, isSingleRack, group.rotation);
        });
        let groupX = renderType === 'room' ? group.x : group.racks[0].x;
        let groupY = renderType === 'room' ? group.y : group.racks[0].y;
        placeAndScaleGroup(parentGroup, groupX, groupY, zoomTransform(layoutSvg.node()));
        if (mode === 'edit') {
            if(isDraggable(user, group.racks[0].type.type)){
                parentGroup.call(closeMenuThenDrag);
            }
        }
    };

    // We are loading an entire room into the svg
    if (renderType === 'room') {
        // Render rack groups, racks, and cages
        (unitsToRender as Room).rackGroups.forEach((group) => {
            createGroup(group);
        });

        // Render room objects
        (unitsToRender as Room).objects.forEach( (roomObj) => {
            const wrapperGroup = layoutSvg.append('g')
                .attr('id', roomObj.itemId + '-wrapper')
                .attr('class', 'draggable room-obj')
                .attr('transform', `translate(${roomObj.x}, ${roomObj.y}) scale(${mode === 'edit' ? roomObj.scale : 1})`)
                .style('pointer-events', 'bounding-box');

            const roomObjGroup = wrapperGroup.append('g')
                .attr('id', roomObj.itemId)
                .attr('transform', `translate(0,0)`)

            const objSvg: SVGElement = loadedSvgs[roomItemToString(roomObj.type)].cloneNode(true) as SVGElement;

            const shape = d3.select(objSvg)
                .classed('draggable', false)
                .attr('pointer-events', 'none');


            roomObjGroup.append(() => shape.node());
            placeAndScaleGroup(wrapperGroup, roomObj.x, roomObj.y, zoomTransform(layoutSvg.node()));
            // Attach context menu if user has permissions for room objects
            if(canOpenContextMenu(user, roomObj.type)){
                setupEditCageEvent(roomObjGroup.node(), setSelectedObj, contextMenuRef, mode, setCtxMenuStyle);
            }
            if(mode === 'edit'){
                // Attach drag functionality if user has permissions
                if(isDraggable(user, roomObj.type)){
                    wrapperGroup.call(closeMenuThenDrag);
                }
            }
        });
    } else if (renderType === 'group') { // we are rendering a single rack group
        createGroup(unitsToRender as RackGroup);

    } else if (renderType === 'rack') { // we are rendering a single rack
    } else { // we are rendering a single cage
        const cage: Cage = unitsToRender as Cage;
        const rackGroup = findCageInGroup(cage.svgId, currRoom.rackGroups).rackGroup;
        const cageGroup = layoutSvg.append('g')
            .attr('id', cage.cageNum)
            .attr('transform', `translate(0,0)`);
        const unitSvg: SVGElement = loadedSvgs[parseRoomItemType((unitsToRender as Cage).cageNum)].cloneNode(true) as SVGElement;

        const shape = d3.select(unitSvg);
        (shape.select('tspan').node() as SVGTSpanElement).textContent = `${parseRoomItemNum((unitsToRender as Cage).cageNum)}`;

        if (mode === 'view') {
            loadCageMods(cage, shape, rackGroup.rotation);
        }
        cageGroup.append(() => shape.node());
    }
};

export const buildNewLocalRoom = async (prevRoom: PrevRoom): Promise<[Room, UnitLocations]> => {
    const newLocalRoom: Room = {
        name: prevRoom.name,
        rackGroups: [],
        valid: false,
        objects: [],
        layoutData: null,
        mods: null
    };
    const newUnitLocs: UnitLocations = createEmptyUnitLoc();
    let newMods: RoomMods = {};
    let roomObjNum = 1;
    const loadMods: boolean = !!prevRoom.modData;
    //check if a group exists for the groupId, if it does return, else create new group for the room
    const findOrAddGroup = (rackItem: FullObjectHistoryData): RackGroup => {
        // groupId is a single number so check if the GroupId string contains it
        let rackGroup: RackGroup = newLocalRoom.rackGroups.find(group => parseLongId(group.groupId) === rackItem.rackGroup);
        if (!rackGroup) {
            //create new rack group if it doesn't exist
            rackGroup = {
                groupId: `rack-group-${rackItem.rackGroup}` as GroupId,
                selectionType: 'rackGroup',
                scale: prevRoom.layoutData.scale,
                rotation: rackItem.groupRotation,
                x: rackItem.xCoord,
                y: rackItem.yCoord,
                racks: []
            };
            newLocalRoom.rackGroups.push(rackGroup);
        }
        return rackGroup;
    };

    //check if a rack exists for the rackId, if it does return, else create new rack for the group
    const findOrAddRack = async (rackGroup: RackGroup, rackItem: FullObjectHistoryData): Promise<Rack> => {
        let rackIdNum: number;
        let rackObjectId;
        let extraContext: ExtraContext;
        let rackData = rackItem.rack as RackData;
        let rack: Rack;
        let rackCondition: RackConditions = RackConditions.Operational;

        if(rackItem.isGhost){
            rackIdNum = (rackItem.cage as GhostCageData).rack;
            rackObjectId = (rackItem.cage as GhostCageData).rackObjId;
            rackCondition = RackConditions.Operational;
        }
        else if (!prevRoom.isDefault) {
            rackIdNum = rackData.rackId;
            rackObjectId = rackData.objectId;
            rackCondition = rackData.condition;
        } else {
            rackIdNum = rackItem.rack as number;
            rackObjectId = `default-rack-${rackIdNum}`;
        }
        rack = rackGroup.racks.find(r => rackObjectId === r.objectId);

        if (!rack) {
            //create new rack if it doesn't exist
            let type: UnitType;
            let typeRowId;
            const rackPrefix = prevRoom.isDefault ? 'default-rack' : 'rack';

            if (!prevRoom.isDefault && !rackItem.isGhost) {
                typeRowId = rackData.rackType;
            }

            // if default get base type, else get rack type from rack id
            const optConfig = {
                schemaName: 'cageui',
                queryName: 'rack_types',
                columns: ['rowid', 'type', 'displayName', 'size', 'manufacturer/value', 'manufacturer/title', 'stationary'],
                filterArray: [
                    Filter.create(prevRoom.isDefault || rackItem.isGhost ? 'type' : 'rowid', prevRoom.isDefault || rackItem.isGhost ? rackItem.objectType : typeRowId, Filter.Types.EQUALS)
                ]
            };

            const rackTypesData = await labkeyActionSelectWithPromise(optConfig);
            if (rackTypesData.rowCount === 0) {
                return;
            }
            let rackEnumType: RackTypes = rackTypesData.rows[0].type;
            if(prevRoom.isDefault) {
                rackEnumType = defaultTypeToRackType(rackTypesData.rows[0].type);
            }
            type = {
                rowid: rackTypesData.rows[0].rowid as number,
                displayName: rackTypesData.rows[0].displayName as string,
                type: rackEnumType,
                size: rackTypesData.rows[0].size,
                manufacturer: {
                    value: rackTypesData.rows[0]['manufacturer/value'],
                    title: rackTypesData.rows[0]['manufacturer/title'],
                },
                isDefault: prevRoom.isDefault,
                stationary: rackTypesData.rows[0].stationary,
            };

            rack = {
                isNew: prevRoom.isDefault,
                objectId: rackObjectId,
                svgId: `rack_${rackObjectId}`,
                selectionType: 'rack',
                cages: [],
                condition: rackCondition,
                isActive: !prevRoom.isDefault,
                itemId: rackIdNum,
                type: type,
                x: rackItem.xCoord - rackGroup.x, // subtract group coords from layout coords to get rack coords
                y: rackItem.yCoord - rackGroup.y,
                extraContext: extraContext?.rack
            };
            rackGroup.racks.push(rack);
        }
        return rack;
    };

    const addCageToRack = async (rack: Rack, rackItem: FullObjectHistoryData, group: RackGroup) => {
        // only string for RackTypes, not DefaultRackTypes, since cageNum is used for location tracking which uses RackTypes
        let cageNumType: RoomItemStringType;
        let extraContext: ExtraContext;
        let cageHistoryData = (rackItem.cage as FullCageHistory)?.cageHistory;
        let cageData = (rackItem.cage as FullCageHistory)?.cageData;
        let ghostCageData = (rackItem.cage as GhostCageData);
        let cageObjId: string;
        let cageNum;
        let cagePositionId;
        if (!prevRoom.isDefault) {
            if(rackItem.objectType === RackTypes.GhostCage){
                cageNum = ghostCageData.cage;
                cageObjId = ghostCageData.cageObjId;
                cagePositionId = ghostCageData.positionId;
                cageNumType = roomItemToString(rackItem.objectType);
            }else{
                cageNum = cageHistoryData.cageNum;
                cageObjId = cageHistoryData.cage;
                cagePositionId = cageData.positionId;
                cageNumType = roomItemToString(rackItem.objectType);
            }
        } else {
            cageNum = rackItem.cage;
            cageObjId = generateUUID();
            cagePositionId = rack.cages.length + 1;
            cageNumType = roomItemToString(defaultTypeToRackType(rackItem.objectType as DefaultRackTypes));
        }

        let cageMods: CageModificationsType;
        if (rackItem.extraContext) {
            extraContext = JSON.parse(rackItem.extraContext);
        }
        const svgSize = await getSvgSize(rack.type.type);

        // This is where mods are loaded into state for the room
        if (loadMods && !rack.type.isDefault && rack.type.type !== RackTypes.GhostCage) {
            cageMods = {
                [ModLocations.Top]: [],
                [ModLocations.Bottom]: [],
                [ModLocations.Left]: [],
                [ModLocations.Right]: [],
                [ModLocations.Direct]: []
            };

            const availMods = await cageModLookup([], []);

            const prevMods = prevRoom.modData.filter((mod) => mod.cage === cageData.objectId);
            prevMods.forEach((mod) => {
                // If Mod id exists in newMods we can skip adding it to newMods
                if (!Object.keys(newMods).find(key => key === mod.modId)) {
                    newMods[mod.modId] = availMods.find(am => am.value === mod.modification);
                }
                // if subId already exists add the mod to that subsection
                if (cageMods[mod.location].find(m => m.subId === mod.subId)) {
                    cageMods[mod.location] = cageMods[mod.location].map(mods => {
                        if (mods.subId === mod.subId) {
                            return {
                                ...mods,
                                modKeys: [...mods.modKeys, {modId: mod.modId, parentModId: mod.parentModId}]
                            };
                        }
                    });
                } else {
                    cageMods[mod.location] = [...cageMods[mod.location], {
                        subId: mod.subId,
                        modKeys: [{modId: mod.modId, parentModId: mod.parentModId}]
                    }];
                }
            });
        }
        const newCageId = generateCageId(cageObjId);
        const cage: Cage = {
            objectId: cageObjId,
            svgId: newCageId,
            cageNum: `${cageNumType}-${cageNum}` as CageNumber,
            extraContext: extraContext?.cage,
            selectionType: 'cage',
            positionId: cagePositionId,
            x: rackItem.xCoord - rack.x - group.x, // get cage coords by subtracting from both rack and group
            y: rackItem.yCoord - rack.y - group.y,
            size: svgSize,
            mods: cageMods,
            animals: rackItem.animals
        };

        newUnitLocs[cageNumType].push({
            cageId: newCageId,
            cellX: group.x + rack.x + cage.x, // global coords
            cellY: group.y + rack.y + cage.y
        });

        rack.cages.push(cage);
    };

    const handleRackItem = async (rackItem: FullObjectHistoryData) => {
        const rackGroup: RackGroup = findOrAddGroup(rackItem);
        const rack: Rack = await findOrAddRack(rackGroup, rackItem);
        await addCageToRack(rack, rackItem, rackGroup);

    };

    // generates room object state for room objects from layout history data
    const generateRoomObj = (roomObjItem: FullObjectHistoryData): RoomObject => {
        let context;
        if (roomObjItem.extraContext) {
            context = JSON.parse(roomObjItem.extraContext);
        }
        return ({
            itemId: `${roomItemToString(roomObjItem.objectType)}-${roomObjNum++}`, // update room obj num after it is used to next num
            type: roomObjItem.objectType as RoomObjectTypes,
            selectionType: 'obj',
            x: roomObjItem.xCoord,
            y: roomObjItem.yCoord,
            scale: prevRoom.layoutData.scale,
            extraContext: context
        });
    };

    for (const roomItem of prevRoom.cagingData) {
        if (isRackEnum(roomItem.objectType)) { // Room item is an enclosure for animals
            await handleRackItem(roomItem);
        } else { // Room item is something else in the room, ex. Door
            newLocalRoom.objects.push(generateRoomObj(roomItem));
        }

    }
    newLocalRoom.mods = newMods;
    return ([newLocalRoom, newUnitLocs]);
};

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
};

export const cageDirectionToModLocation = (loc: CageDirection, rotation: GroupRotation): ModLocations => {
    if(rotation === GroupRotation.Origin){ // 0
        switch (loc) {
            case CageDirection.Left:
                return ModLocations.Left;
            case CageDirection.Right:
                return ModLocations.Right;
            case CageDirection.Top:
                return ModLocations.Top;
            case CageDirection.Bottom:
                return ModLocations.Bottom;
        }
    }else if(rotation === GroupRotation.Quarter){ // 90
        switch (loc) {
            case CageDirection.Left:
                return ModLocations.Bottom;
            case CageDirection.Right:
                return ModLocations.Top;
            case CageDirection.Top:
                return ModLocations.Right;
            case CageDirection.Bottom:
                return ModLocations.Left;
        }
    }else if(rotation === GroupRotation.Half){ // 180
        switch (loc) {
            case CageDirection.Left:
                return ModLocations.Right;
            case CageDirection.Right:
                return ModLocations.Left;
            case CageDirection.Top:
                return ModLocations.Bottom;
            case CageDirection.Bottom:
                return ModLocations.Top;
        }
    }else if(rotation === GroupRotation.ThreeQuarter){ // 270
        switch (loc) {
            case CageDirection.Left:
                return ModLocations.Top;
            case CageDirection.Right:
                return ModLocations.Bottom;
            case CageDirection.Top:
                return ModLocations.Left;
            case CageDirection.Bottom:
                return ModLocations.Right;
        }
    }

};

export const getDefaultMod = (loc: ModLocations): ModTypes | null => {
    if (loc === ModLocations.Top || loc === ModLocations.Bottom) {
        return ModTypes.StandardFloor;
    }
    if (loc === ModLocations.Left || loc === ModLocations.Right) {
        return ModTypes.SolidDivider;
    }
    return null;
};

function getGlobalPosition(box: Cage, rack: Rack, group?: RackGroup): { x: number; y: number } {
    // Calculate the global position of the box
    let x;
    let y;
    if (group) {
        x = group.x + rack.x + box.x;
        y = group.y + rack.y + box.y;
    } else {
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
function getOverlapRange(aStart: number, aEnd: number, bStart: number, bEnd: number): {
    start: number;
    end: number
} | null {
    const start = Math.max(aStart, bStart);
    const end = Math.min(aEnd, bEnd);
    return end - start > EPS ? {start, end} : null;
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
    if (numSections <= 0) {
        return [];
    }
    if (sideLenPx <= 0) {
        return [];
    }

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
    rotation: GroupRotation,
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
        return {location: null, currLines: [], adjLines: []};
    }

    // For determining the actual location in the current perspective
    const locationMap = {
        [GroupRotation.Origin]: { left: ModLocations.Left, right: ModLocations.Right, top: ModLocations.Top, bottom: ModLocations.Bottom },
        [GroupRotation.Quarter]: { left: ModLocations.Bottom, right: ModLocations.Top, top: ModLocations.Left, bottom: ModLocations.Right },
        [GroupRotation.Half]: { left: ModLocations.Right, right: ModLocations.Left, top: ModLocations.Bottom, bottom: ModLocations.Top },
        [GroupRotation.ThreeQuarter]: { left: ModLocations.Top, right: ModLocations.Bottom, top: ModLocations.Right, bottom: ModLocations.Left }
    };

    const locMap = locationMap[rotation];

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
                location: locMap.left,
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
                location: locMap.right,
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
                location: locMap.top,
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
                location: locMap.bottom,
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
export const findConnectedCages = (rack: Rack, rotation: GroupRotation, cage?: Cage) => {

    const connections: ConnectedCages = {
        [ModLocations.Top]: [],
        [ModLocations.Bottom]: [],
        [ModLocations.Right]: [],
        [ModLocations.Left]: [],
        [ModLocations.Direct]: []
    };
    if (cage) {
        for (let i = 0; i < rack.cages.length; i++) {
            if (rack.cages[i].cageNum !== cage.cageNum) {
                const adj = areAdjacent(cage, rack, rack.cages[i], rack, rotation);
                // adj.location is the location of adj cage to current cage meaning if 1 is curr and is left of 2 then adj.location = right. (adj is right of curr)
                if (adj.location !== null) {
                    adj.currLines.forEach(((line, idx) => {
                        const currSubId = parseInt(line.split('-')[1]);
                        const adjSubId = parseInt(adj.adjLines[idx].split('-')[1]);
                        connections[adj.location].push({
                            currSubId: currSubId,
                            adjSubId: adjSubId,
                            currMods: cage.mods ? cage.mods[adj.location]?.find((subMods) => subMods.subId === currSubId)?.modKeys : [],
                            adjMods: rack.cages[i].mods ? rack.cages[i].mods[getAdjLocation(adj.location)]?.find((subMods) => subMods.subId === adjSubId)?.modKeys : [],
                            currCage: cage,
                            adjCage: rack.cages[i]
                        });
                    }));
                }
            }
        }
    } else {
        for (let i = 0; i < rack.cages.length; i++) {
            for (let j = i + 1; j < rack.cages.length; j++) {
                const adj = areAdjacent(rack.cages[i], rack, rack.cages[j], rack, rotation);
                if (adj.location !== null) {
                    adj.currLines.forEach((line, idx) => {
                        const currSubId = parseInt(line.split('-')[1]);
                        const adjSubId = parseInt(adj.adjLines[idx].split('-')[1]);
                        connections[adj.location].push({
                            currSubId: currSubId,
                            adjSubId: adjSubId,
                            currMods: rack.cages[i]?.mods ? rack.cages[i]?.mods[adj.location]?.find((subMods) => subMods.subId === currSubId)?.modKeys : [],
                            adjMods: rack.cages[j]?.mods ? rack.cages[j]?.mods[getAdjLocation(adj.location)]?.find((subMods) => subMods.subId === adjSubId)?.modKeys : [],
                            currCage: rack.cages[i],
                            adjCage: rack.cages[j]
                        });
                    });
                }
            }
        }
    }


    return connections;
};

// This can be done by "guessing" the what other cage coords would be if they were adjacent, if they dont exist then they are not
// If cage is passed then it will only include connections with that cage
export const findConnectedRacks = (group: RackGroup, currRack: Rack, cage?: Cage) => {
    const connections: ConnectedRacks = {
        [ModLocations.Top]: [],
        [ModLocations.Bottom]: [],
        [ModLocations.Right]: [],
        [ModLocations.Left]: [],
        [ModLocations.Direct]: []
    };

    const areRacksConnected = (cRack: Rack, adjRack: Rack) => {
        for (const currCage of cRack.cages) {
            let subId = 1;
            for (const adjCage of adjRack.cages) {

                // If cage is passed then determine if either cage is included and skip if not.
                if (cage) {
                    if (cage.cageNum !== currCage.cageNum && cage.cageNum !== adjCage.cageNum) {
                        continue;
                    }
                }

                const adj = areAdjacent(currCage, cRack, adjCage, adjRack, group.rotation, group);
                // skip racks that arent connected to the current rack
                if (cRack.objectId !== currRack.objectId && adjRack.objectId !== currRack.objectId) {
                    continue;
                }
                if (adj.location !== null) {
                    //[[rack1,cage1], adj, [rack2,cage2]]
                    adj.currLines.forEach((line, idx) => {
                        const currSubId = parseInt(line.split('-')[1]);
                        const adjSubId = parseInt(adj.adjLines[idx].split('-')[1]);
                        connections[adj.location].push({
                            currSubId: currSubId,
                            adjSubId: adjSubId,
                            currRack: cRack,
                            currCage: currCage,
                            adjRack: adjRack,
                            adjCage: adjCage,
                            currMods: currCage?.mods ? currCage.mods[adj.location].find((subMods) => subMods.subId === currSubId)?.modKeys : [],
                            adjMods: adjCage?.mods ? adjCage.mods[getAdjLocation(adj.location)].find((subMods) => subMods.subId === adjSubId)?.modKeys : [],
                        });
                    });
                }
            }
        }
    };

    for (let i = 0; i < group.racks.length; i++) {
        if (group.racks[i].objectId !== currRack.objectId) {
            areRacksConnected(currRack, group.racks[i]);
        }
    }
    return connections;
};

export const saveRoomHelper = async (room: Room, sessionLog: SessionLog, oldTemplateName?: string, prevRackCondition?: RackConditionOption): Promise<LayoutSaveResult> => {
    const newModData: CageMods[] = [];

    const roomName = room.name;
    const oldRoomName: string = oldTemplateName ? oldTemplateName : ActionURL.getParameter('room');

    const isRoomNonDefault = areAllRacksNonDefault(room);
    const isRoomValid = isRoomHomogeneousDefault(room);

    // Check if we have a mix of null and non-null rack values
    if (!isRoomValid) {
        return {
            success: false,
            roomName: roomName,
            reason: ['Cannot save room with mix of default racks and real racks']
        };
        ;
    }

    // Create default mods for new rooms.
    if (isRoomNonDefault) {
        const usedMap = new Map<string, boolean>();

        room.rackGroups.forEach((group) => {
            group.racks.forEach((r) => {
                r.cages.forEach((c) => {
                    const connectedCages = findConnectedCages(r, group.rotation, c);
                    const connectedRacks = findConnectedRacks(group, r, c);

                    // Combine all potential connection directions from both adjacent cages and racks
                    const allDirections = new Set([
                        ...Object.keys(connectedCages),
                        ...Object.keys(connectedRacks)
                    ]);

                    allDirections.forEach((direction) => {
                        const locDir = parseInt(direction) as ModLocations;
                        const cageConnections = connectedCages[locDir] || [];
                        const rackConnections = connectedRacks[locDir] || [];

                        // Only proceed if there is a connection in this direction
                        if (cageConnections.length > 0 || rackConnections.length > 0) {
                            if (c.mods && c.mods[locDir] && c.mods[locDir].length > 0) {
                                // If existing mods exist for this direction, add them
                                c.mods[locDir].forEach(section => {
                                    section.modKeys.forEach(key => {
                                        newModData.push({
                                            cage: c.objectId,
                                            location: locDir,
                                            modId: key.modId,
                                            modification: room.mods[key.modId].value,
                                            parentModId: key.parentModId,
                                            rack: r.objectId,
                                            subId: section.subId,
                                        });
                                    });
                                });
                            } else {
                                // If no mods exist for this connection, add default ones
                                if (cageConnections.length > 0) {
                                    addModEntries(cageConnections, locDir, r, false, newModData, usedMap);
                                }
                                if (rackConnections.length > 0) {
                                    addModEntries(rackConnections, locDir, r, true, newModData, usedMap);
                                }
                            }
                        }
                    });

                    // Handle Direct location mods (not used in connections)
                    if (c.mods && c.mods[ModLocations.Direct] && c.mods[ModLocations.Direct].length > 0) {
                        c.mods[ModLocations.Direct].forEach(section => {
                            section.modKeys.forEach(key => {
                                newModData.push({
                                    cage: c.objectId,
                                    location: ModLocations.Direct,
                                    modId: key.modId,
                                    modification: room.mods[key.modId].value,
                                    parentModId: key.parentModId,
                                    rack: r.objectId,
                                    subId: section.subId,
                                });
                            });
                        });
                    }
                });
            });
        });
    }

    let result: LayoutSaveResult;

    try {
        const layoutSave = await saveRoomLayout(room, newModData, oldRoomName,sessionLog, prevRackCondition);
        let errors;
        if (layoutSave.success === false) {
            errors = Array.isArray(layoutSave.errors) ? layoutSave.errors : [layoutSave.errors];
        }
        result = {success: layoutSave.success, roomName: roomName, reason: errors};
    }
    catch (e) {
        const errors = Array.isArray(e.errors) ? e.errors : [e.errors];
        result = {success: e.success, roomName: roomName, reason: errors.map(err => err.message || err)};
    }
    // Determine success or failure
    return result;
}
