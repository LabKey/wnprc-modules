import {
    Cage,
    CagePosition,
    CageState,
    CageType,
    DefaultCageState,
    Modification,
    Modifications,
    ModTypes,
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

// Helper function to get the rack number
export const parseRack = (input: string) => {
    const regex = /^rect-\d-(\d)$/;
    const match = input.match(regex);
    if (match) {
        return match[1];
    }
    return;
}
// Helper function to get the cage number
export const parseCage = (input: string) => {
    const regex = /rect-(\d+)/;
    const match = input.match(regex);
    if (match) {
        return match[1];
    }
    return;
}

export const parseCageMod = (input: string) => {
    const regex = /.*?-(\d+)/;
    const match = input.match(regex);
    if (match) {
        return parseInt(match[1]);
    }
    return;
}



// load room racks
export const loadRoom = (name: string): Rack[] => {
    const tempRoom: Rack[] = [];
    let cageNum: number = 1;
    let rackConfigs = [];

    const createAdjCages = () => {
        const cageCnt = getTotalCagesInRoom(tempRoom);
        tempRoom.forEach((rack) => {
            rack.cages.forEach((cage) => {
                cage.adjCages = {
                    leftCage: rack.cages.find((tmp) => tmp.id === cage.id - 1),
                    rightCage: rack.cages.find((tmp) => tmp.id === cage.id + 1),
                    floorCage: rack.cages.find((tmp) => tmp.id === getCageAboveOrBelow(cageCnt, cage.id, rackConfigs).cageUnderneathId),
                    ceilingCage: rack.cages.find((tmp) => tmp.id === getCageAboveOrBelow(cageCnt, cage.id, rackConfigs).cageAboveId),
                }
            })
        })
    }

    // generate default cages
    const genCages = (cnt: number, rackType: RackTypes): Cage[] => {
        const cages: Cage[] = [];
        for (let i = 0; i < cnt; i++) {
            let cageState: CageState;
            let position: CagePosition;
            let type: CageType;
            let cagesPerRow: number;
            if(rackType === RackTypes.TwoOfTwo){
                position =  i < 2 ? "top" : "bottom";
                cagesPerRow = 2;
                type = 'cage';
                Object.keys(DefaultCageState.rackTwoOfTwo).forEach((cagePos, idx) => {
                    if(idx === i){
                        cageState = DefaultCageState.rackTwoOfTwo[cagePos];
                    }
                })
                rackConfigs.push({cagesPerRow: 2, rackHeight: 2});
            }
            const tempCage: Cage = {
                id: cageNum,
                name: `#${zeroPad(cageNum, 4)}`,
                cageState: cageState,
                position: position,
                type: type,
                adjCages: undefined
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
                cages: genCages(RoomSchematics[name].cageNum, rackType)
            }
            tempRoom.push(tempRack)
        }
        createAdjCages();
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

// Helper function to convert object keys into location names
export const convertLocationName = (keyName: string) => {
    // Special cases
    if (keyName.toLowerCase() === 'floor') {
        return 'Floor';
    } else if (keyName.toLowerCase().includes('mods')) {
        return 'Extra Mod';
    }

    // Default case
    const words = keyName.split(/(?=[A-Z])/);
    const convertedWords = words.map((word) => convertToTitleCase(word));
    return convertedWords.join(' ');
}

// Helper function to get the correct mods for the dropdowns in cage details
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

// Helper function to find the cage divider positioning for the svg
const getCageDividers = (totalCages, position, cageId, direction) => {
    const cagesPerRow = totalCages / 2;
    const groupCageId = (cageId - 1) % totalCages + 1; // Calculate the ID within the current group

    // Check if the inputs are valid
    if (groupCageId < 1 || groupCageId > totalCages) {
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

    // Determine the line for the top cages
    if (isTop && groupCageId <= cagesPerRow) {
        if (direction === "left" && groupCageId > 1) {
            line = groupCageId - 1;
        } else if (direction === "right" && groupCageId < cagesPerRow) {
            line = groupCageId;
        }
    }

    // Determine the line for the bottom cages
    if (isBottom && groupCageId > cagesPerRow) {
        if (direction === "left" && (groupCageId - cagesPerRow) > 1) {
            line = groupCageId - cagesPerRow - 1;
        } else if (direction === "right" && (groupCageId - cagesPerRow) < cagesPerRow) {
            line = groupCageId - cagesPerRow;
        }
    }

    return line;
}

// Function to find the cage underneath given a cage ID on top
export const getCageAboveOrBelow = (totalCages, boxId, rackConfigurations) => {
    if (boxId < 1 || boxId > totalCages) {
        throw new Error('Invalid box ID');
    }

    let cumulativeCages = 0;

    for (const { cagesPerRow, rackHeight } of rackConfigurations) {
        const cagesPerRack = cagesPerRow * rackHeight;
        cumulativeCages += cagesPerRack;

        if (boxId <= cumulativeCages) {
            // The box belongs to this rack
            const positionInRack = (boxId - 1) % cagesPerRack;
            const row = Math.floor(positionInRack / cagesPerRow);

            let cageUnderneathId = null;
            let cageAboveId = null;

            // Determine the cage underneath
            if (row < rackHeight - 1) {
                cageUnderneathId = boxId + cagesPerRow;
                cageUnderneathId = cageUnderneathId <= cumulativeCages ? cageUnderneathId : null;
            }

            // Determine the cage above
            if (row > 0) {
                cageAboveId = boxId - cagesPerRow;
                cageAboveId = cageAboveId > cumulativeCages - cagesPerRack ? cageAboveId : null;
            }

            return { cageAboveId, cageUnderneathId };
        }
    }

    throw new Error('Box ID does not fit within the provided rack configurations');
}


/*
remove duplicate separators
 */
const removeDuplicatesByPosition = (arr) => {
    const uniquePositions = new Map();

    arr.forEach(item => {
        if (!uniquePositions.has(item.position)) {
            uniquePositions.set(item.position, item);
        }
    });

    return Array.from(uniquePositions.values());
}

/*
Finds the separator modifications that should be mapped to the svg
 */
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

// Find the total number of cages in a room
export const getTotalCagesInRoom = (room) => {
    return room.reduce((total, current) => {
        return total + current.cages.length;
    }, 0);
}

// Finds the cages that are affected by the modification/separator
export const findAffCages = (mod: string | number, cage: Cage) => {
    let affCageName;
    if(mod === "rightDivider") {
        affCageName = cage.adjCages.rightCage.name;
    }else if(mod === "leftDivider"){
        affCageName = cage.adjCages.leftCage.name;
    }else if(mod === "floor") {
        affCageName = cage.adjCages.floorCage.name;
    }else { // TODO Make sure these are correct
        if(mod === ModTypes.PlayCage){
            affCageName = cage.name;
        }else if(mod === ModTypes.Extension){
            affCageName = cage.name;
        }else if(mod === ModTypes.CTunnel){
            if(cage.adjCages.floorCage){
                affCageName = cage.adjCages.floorCage.name;
            }else if(cage.adjCages.ceilingCage){
                affCageName = cage.adjCages.ceilingCage.name;
            }
        }
    }
    if(affCageName){
        return affCageName;
    }else{
        return;
    }
}

export const findCagePartners = (cage: Cage, rack: Rack, newCages: Cage[]) => {
    //Check if cage has right divider
    if(cage.adjCages.rightCage &&
        !(newCages.find((tmpCage) => tmpCage.id === cage.adjCages.rightCage.id))){
        newCages.push(cage.adjCages.rightCage);
    }
    // left divider
    if(cage.adjCages.leftCage &&
        !(newCages.find((tmpCage) => tmpCage.id === cage.adjCages.leftCage.id))){
        newCages.push(cage.adjCages.leftCage);

    } // floor
    if(cage.adjCages.floorCage &&
        !(newCages.find((tmpCage) => tmpCage.id === cage.adjCages.floorCage.id))){
        newCages.push(cage.adjCages.floorCage);
    }
}

export const changeCageModArray = (updateId: number, setClickedCagePartners, modKey: string, event, setSaveDelete?, extModId?, isDone?) => {
    if(event === "delete"){
        setClickedCagePartners(prevState => {
            return prevState.map(cage =>
                cage.id === updateId ? {
                    ...cage,
                    cageState: {
                        ...cage.cageState,
                        [modKey]: cage.cageState[modKey].filter(obj => obj.modData.id !== extModId)
                    }
                } : cage
            );
        });
        setSaveDelete(isDone);
    }else {
        setClickedCagePartners(prevState => {
            return prevState.map(cage =>
                cage.id === updateId ? {
                    ...cage,
                    cageState: {
                        ...cage.cageState,
                        [modKey]: {
                            ...cage.cageState[modKey],
                            modData: {
                                ...cage.cageState[modKey].modData,
                                mod: Object.values(Modifications).find(mod => mod.mod === event.value)
                            }
                        }
                    }
                } : cage
            );
        });
    }
}

export const changeCageMod = (setClickedCage, modKey: string, event, updateId?: number, setSaveDelete?: any) => {
    if(modKey === "extraMods"){

        setClickedCage(prevState => {
            if(event === "delete"){
                setSaveDelete(true);
                return {
                    ...prevState,
                    cageState: {
                        ...prevState.cageState,
                        [modKey]: prevState.cageState[modKey].filter(obj => obj.modData.id !== updateId)
                    }
                }
            }
            const modIndex = prevState.cageState[modKey].findIndex(
                mod => mod.modData.id === updateId
            );
            if (modIndex !== -1) {
                const updatedMods = prevState.cageState[modKey].map((mod, index) =>
                    index === modIndex
                        ? {
                            ...mod,
                            modData: {
                                ...mod.modData,
                                mod: Object.values(Modifications).find(
                                    (mod) => mod.mod === event.value
                                )
                            }
                        }
                        : mod
                );
                return {
                    ...prevState,
                    cageState: {
                        ...prevState.cageState,
                        [modKey]: updatedMods
                    }
                };
            }else{
                console.log("Error: Cannot edit mod that doesn't exist")
            }
        });
    }
    else{
        setClickedCage(prevState => ({
            ...prevState,
            cageState: {
                ...prevState.cageState,
                [modKey]: {
                    ...prevState.cageState[modKey],
                    modData: {
                        ...prevState.cageState[modKey].modData,
                        mod: Object.values(Modifications).find((mod) => mod.mod === event.value)
                    }
                }
            }
        }));
    }
}

/*
Recursive helper function to find all the modifications attached to a cage.
It is recursive because if a cage has no divider/floor, it should combine and repeat.
 */
export const findDetails = (clickedCage, cageDetails, rack) => {
    let newCage: Cage

    Object.keys(clickedCage.cageState).forEach((key) => {
        if(key === "rightDivider"){
            if(clickedCage.cageState.rightDivider.modData.mod.mod === ModTypes.NoDivider){
                newCage = clickedCage.adjCages.rightCage;
                if(cageDetails.find(cage => cage.id === newCage.id)) return;
                cageDetails.push(newCage);
                findDetails(newCage, cageDetails, rack);
            }
        }else if(key === "leftDivider") {
            if(clickedCage.cageState.leftDivider.modData.mod.mod === ModTypes.NoDivider){
                newCage = clickedCage.adjCages.leftCage
                if(cageDetails.find(cage => cage.id === newCage.id)) return;
                cageDetails.push(newCage);
                findDetails(newCage, cageDetails, rack);
            }
        }else if(key === "floor") {
            if (clickedCage.cageState.floor.modData.mod.mod === ModTypes.NoFloor) {
                newCage = clickedCage.adjCages.floorCage;
                if (cageDetails.find(cage => cage.id === newCage.id)) return;
                cageDetails.push(newCage);
                findDetails(newCage, cageDetails, rack);
            }
        }
    })

}


const cleanString = (name: string) => {
    return name.toLowerCase().replace(/[\s-]/g, '');
}
export const getCageMod = (modId: string, rack: Rack) => {
    const rackPos = parseCageMod(modId);
    const cage = rack.cages[rackPos - 1];
    const mod = parseSeparator(modId);
    let cageMod: Modification;
    if(cage.cageState.extraMods?.length > 0){
        cage.cageState.extraMods.forEach((extMod, idx) => {
            const cleanName = cleanString(extMod.modData.mod.name)
            const cleanModName = cleanString(mod);
            if(cleanName === cleanModName){
                cageMod = cage.cageState.extraMods[idx].modData.mod;
                return cageMod;
            }
        })
        // if ctunnel mod check floor cage as well. (delete later I think)
        // This is only here because the two ctunnels are not linked?
        // What i mean is. if a cage doesn't have a ctunnel, the bottom one wont have it either
        if(mod === "CTunnel") {
            if(cage.adjCages.floorCage?.cageState.extraMods.length > 0){
                cage.adjCages.floorCage.cageState.extraMods.forEach((extMod, idx) => {
                    const cleanName = cleanString(extMod.modData.mod.name);
                    if(cleanName !== "ctunnel") return;
                    const cleanModName = cleanString(mod);
                    if(cleanName === cleanModName){
                        cageMod = cage.adjCages.floorCage.cageState.extraMods.find((tmpMod) =>
                            tmpMod.modData.mod.mod === ModTypes.CTunnel).modData.mod;
                    }
                })
            }
        }
    }
    return cageMod
}