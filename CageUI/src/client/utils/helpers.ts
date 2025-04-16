import {
    DefaultRackStringType,
    DefaultRackTypes,
    Rack,
    RackGroup,
    RackStringType,
    RackTypes,
    Room,
    RoomItemStringType,
    RoomItemType,
    RoomObjectStringType,
    RoomObjectTypes,
    UnitType
} from '../types/typings';
import * as d3 from 'd3';
import { zoomTransform } from 'd3';
import { MutableRefObject } from 'react';
import { ActionURL, Filter } from '@labkey/api';
import { placeAndScaleGroup, setupEditCageEvent } from './LayoutEditorHelpers';
import { SelectDistinctOptions } from '@labkey/api/dist/labkey/query/SelectDistinctRows';
import { selectDistinctRows } from '@labkey/components';


export const zeroPadName = (num, places) => {return(String(num).padStart(places, '0'))};

//TODO link with cage size table in labkey instead of hardcoding
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

export const parseSeparator = (input: string): string | null => {
    const match = input.match(/^([^-]+)/); // matches and returns out the first word before a "-"
    return match ? match[0] : null;
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
export const addPrevRoomSvgs = (mode: 'edit' | 'view', room: Room, layoutSvg: d3.Selection<SVGElement, {}, HTMLElement, any>, closeMenuThenDrag?, setSelectedObj?, setCtxMenuStyle?, contextMenuRef?: MutableRefObject<Room>) => {

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
                    (cageGroup.node() as SVGElement).appendChild(d.documentElement);
                    console.log("Id: ", cage);
                    cageGroup.select('#name').selectChild().text(parseRoomItemNum(cage.cageNum));
                });
                return;
            }

            // Only needed for layout editor to attach context menus
            const shape = d3.select(unitSvg);
            shape.classed('draggable', false);
            shape.style('pointer-events', 'none');

            const cageGroupContext = shape.select(`#${rackTypeString}`).node() as SVGGElement;

            setupEditCageEvent(cageGroupContext, setSelectedObj, setCtxMenuStyle, contextMenuRef, rackTypeString);
            (shape.select('tspan').node() as SVGTSpanElement).textContent = `${parseRoomItemNum(cage.cageNum)}`;
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
        placeAndScaleGroup(parentGroup, group.x, group.y, zoomTransform(layoutSvg.node()));
        if (mode === 'edit') {
            parentGroup.call(closeMenuThenDrag);
        }
    };

    room.rackGroups.forEach((group) => {
        createGroup(group);
    });

    room.objects.forEach(async (roomObj) => {
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
        setupEditCageEvent(roomObjGroup.node() as SVGGElement, setSelectedObj, setCtxMenuStyle, contextMenuRef);
        roomObjGroup.call(closeMenuThenDrag);
    });

};