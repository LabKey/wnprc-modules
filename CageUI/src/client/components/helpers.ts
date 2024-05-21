import {
    Cage,
    CagePosition,
    CageState,
    CageType,
    DefaultCageState,
    Modification,
    Modifications,
    Rack,
    RackTypes,
    RoomSchematics,
    SeparatorMod,
    SeparatorPosition,
    Separators,
    SeparatorType
} from './typings';

/*
console.log(zeroPad(5, 2)); // "05"
console.log(zeroPad(5, 4)); // "0005"
console.log(zeroPad(5, 6)); // "000005"
 */
export const zeroPad = (num, places) => String(num).padStart(places, '0')

export const parseRack = (input: string) => {
    const regex = /cage\w-(\d+)/;
    const match = input.match(regex);
    if (match) {
        return match[1];
    }
    return;
}

export const parseCage = (input: string) => {
    const regex = /cage-(\d+)/;
    const match = input.match(regex);
    if (match) {
        return match[1];
    }
    return;
}


// load room racks
export const loadRoom = (name: string): Rack[] => {
    const tempRoom: Rack[] = [];
    let cageNum: number = 1;

    // generate default cages
    const genCages = (cnt: number, rackType: RackTypes): Cage[] => {
        const cages: Cage[] = [];
        for (let i = 0; i < cnt; i++) {
            let cageState: CageState;
            let position: CagePosition;
            let type: CageType;
            if(rackType === RackTypes.TwoOfTwo){
                position =  i < 2 ? "top" : "bottom";
                type = 'cage';
                Object.keys(DefaultCageState.rackTwoOfTwo).forEach((cagePos, idx) => {
                    if(idx === i){
                        cageState = DefaultCageState.rackTwoOfTwo[cagePos];
                    }
                })
            }
            const tempCage: Cage = {
                id: cageNum,
                name: zeroPad(cageNum, 4),
                cageState: cageState,
                position: position,
                type: type
            }
            cageNum++;
            cages.push(tempCage);
        }
        return cages;
    }

    if(RoomSchematics[name]){
        for (let i = 0; i < RoomSchematics[name].rackNum; i++) {
            const rackId = i + 1;
            const rackType: RackTypes = RoomSchematics[name].rackTypes.length === 1 ? RoomSchematics[name].rackTypes[0] : RoomSchematics[name].rackTypes[rackId];

            const tempRack: Rack = {
                id: rackId,
                type: rackType,
                cages: genCages(RoomSchematics[name].cageNum, rackType),

            }
            tempRoom.push(tempRack)
        }
    }
    return tempRoom
}

// Changes stroke color of svg element nodes keeping the other styles.
export const changeStyleProperty  = (element: Element, property: string, newValue: string): void => {
    const styleAttr = element.getAttribute('style');
    if (styleAttr) {
        const styles = styleAttr.split(';').map(style => style.trim());
        let updated = false;
        const updatedStyles = styles.map(style => {
            const [prop, value] = style.split(':').map(prop => prop.trim());
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

export const parseSeparator = (input: string): string | null => {
    const match = input.match(/^([^-]+)/);
    return match ? match[0] : null;
}


const convertToTitleCase = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export const convertLocationName = (dividerName: string) => {
    // Special cases
    if (dividerName.toLowerCase() === 'floor') {
        return 'Floor';
    } else if (dividerName.toLowerCase().includes('mods')) {
        return 'Extra Mod';
    }

    // Default case
    const words = dividerName.split(/(?=[A-Z])/);
    const convertedWords = words.map((word) => convertToTitleCase(word));
    return convertedWords.join(' ');
}

export const getModOptions = (key) => {
    const dividerOptions= [];

    const floorOptions = [];

    const extraOptions = [];

    Object.keys(Modifications).forEach((mod, idx) => {
        if(mod.includes("Divider")){
            dividerOptions.push({value: Modifications[mod].mod, label: Modifications[mod].name});
        }else if(mod.includes("Floor")) {
            floorOptions.push({value: Modifications[mod].mod, label: Modifications[mod].name});
        }else {
            extraOptions.push({value: Modifications[mod].mod, label: Modifications[mod].name});
        }
    });

    return key.toLowerCase().includes("divider") ? dividerOptions : key.toLowerCase().includes("floor") ? floorOptions : extraOptions;
}

const getCageDividers = (totalBoxes, position, boxId, direction) => {
    const boxesPerRow = totalBoxes / 2;
    const groupBoxId = (boxId - 1) % totalBoxes + 1; // Calculate the ID within the current group

    // Check if the inputs are valid
    if (groupBoxId < 1 || groupBoxId > totalBoxes) {
        throw new Error('Invalid box ID');
    }
    if (position !== "top" && position !== "bottom") {
        throw new Error('Invalid position');
    }
    if (direction !== "left" && direction !== "right") {
        throw new Error('Invalid direction');
    }

    const isTop = position === "top";
    const isBottom = position === "bottom";

    let line = null;

    // Determine the line for the top boxes
    if (isTop && groupBoxId <= boxesPerRow) {
        if (direction === "left" && groupBoxId > 1) {
            line = groupBoxId - 1;
        } else if (direction === "right" && groupBoxId < boxesPerRow) {
            line = groupBoxId;
        }
    }

    // Determine the line for the bottom boxes
    if (isBottom && groupBoxId > boxesPerRow) {
        if (direction === "left" && (groupBoxId - boxesPerRow) > 1) {
            line = groupBoxId - boxesPerRow - 1;
        } else if (direction === "right" && (groupBoxId - boxesPerRow) < boxesPerRow) {
            line = groupBoxId - boxesPerRow;
        }
    }

    return line;
}

// Function to find the box underneath given a box ID on top
export const getCageUnderneath = (totalCages, cagesPerRack, cageId) => {

    if (cageId < 1 || cageId > totalCages) {
        throw new Error('Invalid box ID');
    }

    // Determine the position within the rack (0-3)
    const positionInRack = (cageId - 1) % cagesPerRack;

    // Check if the box is on the top row (position 0 or 1)
    if (positionInRack < 2) {
        // Calculate the ID of the box underneath
        return cageId + 2;
    } else {
        return null;
    }
}

const removeDuplicatesByPosition = (arr) => {
    const uniquePositions = new Map();

    arr.forEach(item => {
        if (!uniquePositions.has(item.position)) {
            uniquePositions.set(item.position, item);
        }
    });

    return Array.from(uniquePositions.values());
}

export const getRackSeparators = (rack: Rack): Separators => {
    const separators: Separators = [];
    for (const cage of rack.cages) {
        for (const cageSep in cage.cageState) {
            if(cageSep === "extraMods") continue;
            let newSep: SeparatorMod;
            let newType: SeparatorType;
            let newPos: SeparatorPosition;
            let newMod: Modification

            if(cageSep.toLowerCase().includes("floor")) { // floor
                const floorId = (cage.id - 1) % rack.cages.length + 1;
                newType = "floor";
                newPos = `F${floorId}` as `F${number}`;
                newMod = cage.cageState[cageSep].modData.mod;

            }else if(cageSep.toLowerCase().includes("right")) { // right divider
                const posId = getCageDividers(rack.cages.length, cage.position, cage.id, "right");
                newType = "divider";
                if(cage.position === "top") {
                    newPos = `T${posId}` as `T${number}`;
                }else{
                    newPos = `B${posId}` as `T${number}`;
                }
                newMod = cage.cageState[cageSep].modData.mod;
            }else { // left divider
                const posId = getCageDividers(rack.cages.length, cage.position, cage.id, "left");
                newType = "divider";
                if(cage.position === "top") {
                    newPos = `T${posId}` as `T${number}`;
                }else{
                    newPos = `B${posId}` as `T${number}`;
                }
                newMod = cage.cageState[cageSep].modData.mod;
            }

            newSep = {
                type: newType,
                mod: newMod,
                position: newPos
            }
            separators.push(newSep);
        }
    }
    return(removeDuplicatesByPosition(separators));
}
