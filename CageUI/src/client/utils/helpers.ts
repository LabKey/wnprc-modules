import {
    DefaultRackStringType,
    DefaultRackTypes,
    RackStringType,
    RackTypes, RoomItemStringType,
    RoomItemType,
    RoomObjectStringType,
    RoomObjectTypes
} from '../types/typings';

export const zeroPadName = (num, places) => {return(String(num).padStart(places, '0'))};

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

export const parseSeparator = (input: string): string | null => {
    const match = input.match(/^([^-]+)/); // matches and returns out the first word before a "-"
    return match ? match[0] : null;
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

export const stringToRoomItem = (formattedString: RoomItemStringType): RoomItemType => {
    // Uppercase the first letter of the string
    const itemKey = formattedString.charAt(0).toUpperCase() + formattedString.slice(1);

    const rackItem = RackTypes[itemKey as keyof typeof RackTypes];
    const objItem = RoomObjectTypes[itemKey as keyof typeof RoomObjectTypes];
    const defaultRackItem = DefaultRackTypes[itemKey as keyof typeof DefaultRackTypes];

    // Use the EnumType object to look up the value
    return rackItem || defaultRackItem || objItem;
}

