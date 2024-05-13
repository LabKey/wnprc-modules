import {
    Cage,
    CageState,
    DefaultCageState,
    Modifications,
    Rack,
    RackSeparators,
    RackTypes,
    RoomSchematics
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
    const genCages = (cnt: number, rackType: RackTypes, separators): Cage[] => {
        const cages: Cage[] = [];
        for (let i = 0; i < cnt; i++) {
            let cageState: CageState;
            let position: string;
            if(rackType === RackTypes.TwoOfTwo){
                position =  i < 2 ? "top" : "bottom";
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
                position: position
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
            let separators; // either a divider or floor used to combine/seperate cages
            if(rackType === RackTypes.TwoOfTwo) {
                separators = RackSeparators.rackTwoOfTwo;
            }
            const tempRack: Rack = {
                id: rackId,
                type: rackType.toString(),
                separators: separators,
                cages: genCages(RoomSchematics[name].cageNum, rackType, separators),

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