/*
console.log(zeroPad(5, 2)); // "05"
console.log(zeroPad(5, 4)); // "0005"
console.log(zeroPad(5, 6)); // "000005"
 */
import { Cage, Rack, RoomSchematics } from './typings';

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
    const genCages = (cnt: number): Cage[] => {
        const cages: Cage[] = [];
        for (let i = 0; i < cnt; i++) {
            const tempCage: Cage = {
                id: cageNum,
                name: zeroPad(cageNum, 4)
            }
            cageNum++;
            cages.push(tempCage);
        }
        return cages;
    }

    if(RoomSchematics[name]){
        for (let i = 0; i < RoomSchematics[name].rackNum; i++) {
            const tempRack: Rack = {id: i + 1, cages: genCages(RoomSchematics[name].cageNum)}
            tempRoom.push(tempRack)
        }
    }
    return tempRoom
}