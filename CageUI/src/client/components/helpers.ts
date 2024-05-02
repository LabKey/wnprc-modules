/*
console.log(zeroPad(5, 2)); // "05"
console.log(zeroPad(5, 4)); // "0005"
console.log(zeroPad(5, 6)); // "000005"
 */
import { Cage, Rack } from './typings';

export const zeroPad = (num, places) => String(num).padStart(places, '0')



// load room racks
export const loadRoom = (type: string): Rack[] => {
    const tempRoom: Rack[] = [];
    let cageNum: number = 0;

    // generate default cages
    const genCages = (cnt: number): Cage[] => {
        const cages: Cage[] = [];
        for (let i = 0; i < cnt; i++) {
            const tempCage: Cage = {
                id: cageNum,
                name: zeroPad((cageNum + 1), 4)
            }
            cageNum++;
            cages.push(tempCage);
        }
        return cages;
    }

    if(type === "ab"){// 6 x 4
        for (let i = 0; i < 6; i++) {
            const tempRack: Rack = {id: i, cages: genCages(4)}
            tempRoom.push(tempRack)
        }
    }

    return tempRoom
}