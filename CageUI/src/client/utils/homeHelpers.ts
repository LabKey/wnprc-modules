import { convertToTitleCase } from './helpers';
import { Cage, CageDirection, CurrCageMods, ModDirections, ModLocations, ModTypes, RoomMods } from '../types/typings';
import { Option } from '@labkey/components';
import { cageModLookup } from '../api/popularQueries';

// Returns a better formatted string for the modification directions shown to users
export const findDirStr = (dir: ModLocations) => {
    return dir === ModLocations.Bottom ? 'Above'
        : dir === ModLocations.Top ? 'Below'
        : dir === ModLocations.Right ? `${ModLocations[ModLocations.Left]} of`
            : `${ModLocations[ModLocations.Right]} of`;
}

export const getLocationDirection = (location: CageDirection | ModLocations): ModDirections => {
    // Check for ModLocations enum values
    if (Object.values(ModLocations).includes(location as ModLocations)) {
        if (location === ModLocations.Direct) return ModDirections.Direct;
        return location === ModLocations.Top || location === ModLocations.Bottom
            ? ModDirections.Vertical
            : ModDirections.Horizontal;
    }

    // Otherwise it must be CageDirection
    return location === CageDirection.Top || location === CageDirection.Bottom
        ? ModDirections.Vertical
        : ModDirections.Horizontal;
}

/*
export const findNextModId = (mods: CageModification[]) => {
    if (!mods || mods.length === 0) return 1;

    const ids = mods.map(mod => mod.id);
    const maxId = Math.max(...ids);
    return maxId + 1;
}

export const fixModIds = (mods: CageModification[]) => {
    const newMods: CageModification[] = [];
    mods.forEach((mod, idx) => {
        newMods.push({
            ...mod,
            id: idx + 1,
        })
    })
    return newMods;
}
*/

export const compareMods = (oldModData: RoomMods, newModData: CurrCageMods)=> {

    //TODO Fix this or make sure it works in all cases
    // Deep comparison helper (simplified - you might want to use lodash's isEqual in real code)
    function isEqual(obj1: any, obj2: any): boolean {
        return JSON.stringify(obj1) === JSON.stringify(obj2);
    }

    const changes: {
        direction: string;
        type: 'added' | 'removed' | 'modified';
        mod: ModTypes;
        oldMod?: ModTypes; // Only for modified mods
    }[] = [];

    newModData.currCage.forEach((directMod) => {

    })
/*
    const oldModObj: CurrRoomMods = {
        currCage: [],
        adjCages: [],
        adjRacks: []
    }

    if(oldModData){
        oldModData.forEach((oldMod, idx) => {
            oldModObj.mods[oldMod.location].push({
                mods: [{
                    id: oldMod.locationId,
                    mod: oldMod.modification
                }],
                subId: idx
            })
        })
    }


    Object.keys(ModLocations)
        .filter(key => !isNaN(Number(key)))
        .forEach(direction => {
            // Flatten all mods from all subsections for this direction
            const oldMods = (oldModObj.mods[direction] || [])
                .flatMap(sub => sub.mods.map(mod => ({ ...mod, subId: sub.subId})));

            const newMods = (newModObj.mods[direction] || [])
                .flatMap(sub => sub.mods.map(mod => ({ ...mod, subId: sub.subId})));

            // Create maps for easier lookup
            const oldModsMap = new Map<string, CageModification>(oldMods.map(mod => [`${mod.subId}-${mod.id}`, mod]));
            const newModsMap = new Map<string, CageModification>(newMods.map(mod => [`${mod.subId}-${mod.id}`, mod]));

            // Check for removed mods (in old but not in new)
            oldMods.forEach(oldMod => {
                const compositeKey = `${oldMod.subId}-${oldMod.id}`;
                if (!newModsMap.has(compositeKey)) {
                    changes.push({
                        direction,
                        type: 'removed',
                        mod: oldMod,
                        subsectionId: oldMod.subId
                    });
                }
            });

            // Check for added and modified mods
            newMods.forEach(newMod => {
                const compositeKey = `${newMod.subId}-${newMod.id}`;
                if (!oldModsMap.has(compositeKey)) {
                    changes.push({
                        direction,
                        type: 'added',
                        mod: newMod,
                        subsectionId: newMod.subId
                    });
                } else {
                    const oldMod = oldModsMap.get(compositeKey)!;
                    if (!isEqual(oldMod, newMod)) {
                        changes.push({
                            direction,
                            type: 'modified',
                            mod: newMod,
                            oldMod: oldMod,
                            subsectionId: newMod.subId
                        });
                    }
                }
            });
        });*/

    return changes;
}

export const getRackFromClass = (classString: string) => {
    let rackClass = classString.match(/rack-\d+/);

    if (rackClass) {
        let rackId = rackClass[0].split('-')[1];
        return rackId;
    }
}

export const parseEditRect = (input: string) => {
    const regex = /blur-(\d+)/;
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
/*
export const genCages = (cnt: number, rackType: RackTypes, cageTypes: CageBuilder[], cageSizes: CageSizeWithKey[], rackId: number, rackConfigs, cageNum): Cage[] => {
    const cages: Cage[] = [];
    for (let i = 0; i < cnt; i++) {
        let cageState: CageState;
        let position: CagePosition;
        let type: CageType;
        let cagesPerRow: number;
        let cageSize: CageSizeWithKey;
        let rackHeight: number;
        let manufacturer: CageBuilder;
        if(rackType === RackTypes.TwoOfTwo){
            position =  i < 2 ? "top" : "bottom";
            cagesPerRow = 2;
            rackHeight = 2;
            type = 'cage';
            Object.keys(DefaultCageState.rackTwoOfTwo).forEach((cagePos, idx) => {
                if(idx === i){
                    cageState = DefaultCageState.rackTwoOfTwo[cagePos];
                }
            })
            rackConfigs.push({cagesPerRow: cagesPerRow, rackHeight: rackHeight});
            if(cageSizes.length !== 1){
                cageSize = cageSizes[rackId - 1];
            }else{
                cageSize = cageSizes[0];
            }
            if(cageTypes.length !== 1){
                manufacturer = cageTypes[rackId - 1];
            }else{
                manufacturer = cageTypes[0];
            }
        }
        const tempCage: Cage = {
            id: cageNum,
            cageNum: cageNum,
            name: zeroPadName(cageNum, 4),
            cageState: cageState,
            position: position,
            type: type,
            adjCages: undefined,
            size: cageSize,
            manufacturer: manufacturer,
        }
        cageNum++;
        cages.push(tempCage);
    }
    return cages;
}
*/
/*
export const addNewRack = (
    selectedEditRect: SVGRectElement,
    gridSize: number,
    localRoom: Rack[],
    room: Rack[],
    addRack: (newRack: Rack) => void,
    setAddingRack: (adding: boolean) => void,
    rackType: RackTypes,
    rackLoc?: number
) => {
    console.log("Adding Rack");
    const rect:SVGRectElement = selectedEditRect ? selectedEditRect : d3.select(`#add-rack-${rackLoc}`).node() as SVGRectElement;
    const id = parseInt(parseAddRack(rect.id));
    const x = parseInt(rect.getAttribute('x')) / gridSize;
    const y = parseInt(rect.getAttribute('y')) / gridSize;

    if(localRoom.find((rack) => rack.id === id)){
        return;
    }

    const cageNum = findCageCount(rackType);
    const cageCount: number = 1;

    const newRack: Rack = {
        id: id,
        type: rackType,
        xPos: x,
        yPos: y,
        isActive: true,
        cages: genCages(cageNum, rackType, ['Suburban'], [CageSizes['8.0']], id, [], cageCount)
    };
    addRack(newRack);
    setAddingRack(false);
};

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


    if(RoomSchematics[name]){
        for (let i = 0; i < RoomSchematics[name].rackNum; i++) {
            const rackId = i + 1;
            const rackType: RackTypes = RoomSchematics[name].rackTypes.length === 1 ? RoomSchematics[name].rackTypes[0] : RoomSchematics[name].rackTypes[rackId];
            const tempRack: Rack = {
                id: rackId,
                type: rackType,
                cages: genCages(RoomSchematics[name].cageNum, rackType, RoomSchematics[name].cageTypes, RoomSchematics[name].cageSizes, rackId, rackConfigs, cageNum),
                isActive: true,
                xPos: 0,
                yPos: 0,
            }
            tempRoom.push(tempRack);
            cageNum += tempRack.cages.length;
        }
        createAdjCages();
    }
    return tempRoom
}*/

// Helper function to convert object keys into location names
export const getDirectionString = (dir: CageDirection) => {
    // Special cases
    if(dir === CageDirection.Left || dir === CageDirection.Right){
        return `${CageDirection[dir]} of`;
    }else if(dir === CageDirection.Top){
        return "Above";
    }else{
        return "Below";
    }
}
//
// // Helper function to get the correct mods for the dropdowns in cage details
// export const getModOptions = (key) => {
//     const dividerOptions= [];
//
//     const floorOptions = [];
//
//     const extraOptions = [];
//
//     Object.keys(Modifications).forEach((mod, idx) => {
//         if(mod.includes("Divider")){
//             dividerOptions.push({value: Modifications[mod].mod, label: Modifications[mod].name});
//         }else if(mod.includes("Floor")) {
//             floorOptions.push({value: Modifications[mod].mod, label: Modifications[mod].name});
//         }else {
//             extraOptions.push({value: Modifications[mod].mod, label: Modifications[mod].name});
//         }
//     });
//
//     return key.toLowerCase().includes("divider") ? dividerOptions : key.toLowerCase().includes("floor") ? floorOptions : extraOptions;
// }

// Helper function to find the cage divider positioning for the svg
const getCageDividers = (totalCages, position, cageId, direction) => {
    const cagesPerRow = totalCages / 2;
    const groupCageId = (cageId - 1) % totalCages + 1; // Calculate the ID within the current group

    // Check if the inputs are valid
    if (groupCageId < 1 || groupCageId > totalCages) {
        throw new Error('Invalid cage ID');
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
export const getCageAboveOrBelow = (totalCages, cageId, rackConfigurations) => {
    if (cageId < 1 || cageId > totalCages) {
        throw new Error('Invalid cage ID');
    }

    let cumulativeCages = 0;

    for (const { cagesPerRow, rackHeight } of rackConfigurations) {
        const cagesPerRack = cagesPerRow * rackHeight;
        cumulativeCages += cagesPerRack;

        if (cageId <= cumulativeCages) {
            // The cage belongs to this rack
            const positionInRack = (cageId - 1) % cagesPerRack;
            const row = Math.floor(positionInRack / cagesPerRow);

            let cageUnderneathId = null;
            let cageAboveId = null;

            // Determine the cage underneath
            if (row < rackHeight - 1) {
                cageUnderneathId = cageId + cagesPerRow;
                cageUnderneathId = cageUnderneathId <= cumulativeCages ? cageUnderneathId : null;
            }

            // Determine the cage above
            if (row > 0) {
                cageAboveId = cageId - cagesPerRow;
                cageAboveId = cageAboveId > cumulativeCages - cagesPerRack ? cageAboveId : null;
            }

            return { cageAboveId, cageUnderneathId };
        }
    }

    throw new Error('Cage ID does not fit within the provided rack configurations');
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
}*/

// Find the total number of cages in a room
export const getTotalCagesInRoom = (room) => {
    return room.reduce((total, current) => {
        return total + current.cages.length;
    }, 0);
}

/*
// Finds the cages that are affected by the modification/separator
export const findAffCages = (mod: string, cage: Cage) => {
    let affCageName;
    if(mod === "rightDivider") {
        affCageName = cage.adjCages.rightCage.name;
    }else if(mod === "leftDivider"){
        affCageName = cage.adjCages.leftCage.name;
    }else if(mod === "floor") {
        affCageName = cage.adjCages.floorCage.name;
    }else {
        const cageMod = cage.cageState.extraMod.modData.mod.mod;
        if(cageMod === ModTypes.PlayCage){
            affCageName = cage.name;
        }else if(cageMod === ModTypes.Extension){
            affCageName = cage.name;
        }else if(cageMod === ModTypes.CTunnel){
            if(cage.adjCages.floorCage){
                affCageName = cage.adjCages.floorCage.name;
            }else if(cage.adjCages.ceilingCage){
                affCageName = cage.adjCages.ceilingCage.name;
            }
        }
    }
    return affCageName;
}*/
//
// export const changeCageModArray = (updateId: number, setClickedCagePartners, modKey: string, event) => {
//     setClickedCagePartners(prevState => {
//         return prevState.map(cage =>
//             cage.id === updateId ? {
//                 ...cage,
//                 cageState: {
//                     ...cage.cageState,
//                     [modKey]: {
//                         ...cage.cageState[modKey],
//                         modData: {
//                             ...cage.cageState[modKey].modData,
//                             mod: Object.values(Modifications).find(mod => mod.mod === event.value)
//                         }
//                     }
//                 }
//             } : cage
//         );
//     });
// }
//
// export const changeCageMod = (setClickedCage, modKey: string, event?) => {
//     setClickedCage(prevState => ({
//         ...prevState,
//         cageState: {
//             ...prevState.cageState,
//             [modKey]: {
//                 ...prevState.cageState[modKey],
//                 modData: {
//                     ...prevState.cageState[modKey].modData,
//                     mod: Object.values(Modifications).find((mod) => mod.mod === event.value)
//                 }
//             }
//         }
//     }));
// }
//
// export const updateClickedRack = (setClickedRack, modKey: string, cageId: number, event) => {
//     setClickedRack(prevState => ({
//         ...prevState,
//         cages: prevState.cages.map(cage =>
//             cage.id === cageId
//                 ? {
//                     ...cage,
//                     cageState: {
//                         ...cage.cageState,
//                         [modKey]: {
//                             ...cage.cageState?.[modKey],
//                             modData: {
//                                 ...cage.cageState?.[modKey]?.modData,
//                                 mod: Object.values(Modifications).find(mod => mod.mod === event.value)
//                             }
//                         }
//                     }
//                 }
//                 : cage
//         )
//     }));
// }

/*
Recursive helper function to find all the modifications attached to a cage.
It is recursive because if a cage has no divider/floor, it should combine and repeat.
 */
export const findDetails = (clickedCage, cageDetails, rack) => {
    let newCage: Cage

    Object.keys(clickedCage.cageState).forEach((key) => {
        if(key === "rightDivider"){
            if(clickedCage.cageState.rightDivider.modData.mod.mod === ModTypes.NoDivider){
                newCage = rack.cages.find(cage => cage.id === clickedCage.adjCages.rightCage.id);
                if(cageDetails.find(cage => cage.id === newCage.positionId)) return;
                cageDetails.push(newCage);
                findDetails(newCage, cageDetails, rack);
            }
        }else if(key === "leftDivider") {
            if(clickedCage.cageState.leftDivider.modData.mod.mod === ModTypes.NoDivider){
                newCage = rack.cages.find(cage => cage.id === clickedCage.adjCages.leftCage.id);
                if(cageDetails.find(cage => cage.id === newCage.positionId)) return;
                cageDetails.push(newCage);
                findDetails(newCage, cageDetails, rack);
            }
        }else if(key === "floor") {
            if (clickedCage.cageState.floor.modData.mod.mod === ModTypes.NoFloor) {
                newCage = rack.cages.find(cage => cage.id === clickedCage.adjCages.floorCage.id);
                if (cageDetails.find(cage => cage.id === newCage.positionId)) return;
                cageDetails.push(newCage);
                findDetails(newCage, cageDetails, rack);
            }
        }
    })
}

export const removeCircularReferences = (obj) => {
    const seen = new WeakSet();
    return JSON.parse(JSON.stringify(obj, (key, value) => {
        if (typeof value === 'object' && value !== null) {
            if (seen.has(value)) {
                return;
            }
            seen.add(value);
        }
        return value;
    }));
}



export const resetMod = async  (value: ModTypes):  Promise<Option<ModTypes>> => {
    // todo perform async lookup to determine what type the mod is.

    const newVal: Option<ModTypes> = {label: '', value: value}

    const rows = await cageModLookup([],[]);
    if(rows.length > 0){
        console.log("Mod Lookup: ", rows);
    }


    return newVal;
}
