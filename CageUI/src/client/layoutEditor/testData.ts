import { LayoutHistoryData } from '../components/typings';

export const testCageModifications = [
    {
        rowid: 1,
        name: "Solid Divider"
    },
    {
        rowid: 2,
        name: "Mesh Floor"
    },
    {
        rowid: 3,
        name: "C-Tunnel"
    }
];

export const testRoom = {
    rowid: 68,
    room: "ab140",
    building: "",
    area: "AB-New",
    housingType: null,
    housingCondition: null,
    maxCages: 26
}

export const testCageTypes1 = {
    rowid: 1,
    cagetype: "cage-at-6.7",
    type: "cage",
    manufacturer: "allentown",
    length: 31.0,
    width: 31.25,
    height: 33.0,
    sqft: 6.7,
    supportsTunnel: true,
    abbreviation: "at",
    description: "6.7 sq ft allentown cage"
}

export const testCageTypes2 = {
    rowid: 2,
    cagetype: "pen-uk-44",
    type: "pen",
    manufacturer: "unknown",
    length: 122.0,
    width: 52.0,
    height: 98.5,
    sqft: 44.0,
    supportsTunnel: false,
    abbreviation: "uk",
    description: "44 sq ft pen"
}

export const testCage1 = {
    rowid: 1,
    location: "rck1-0001",
    cageNum: "0001",
    x: 0,
    y: 0,
    rack: "rck1",
    cagetype: testCageTypes1.cagetype,
    room: testRoom.room
}
export const testCage2 = {
    rowid: 2,
    location: "rck1-0002",
    cageNum: "0002",
    x: 120,
    y: 0,
    rack: "rck1",
    cagetype: testCageTypes1.cagetype,
    room: testRoom.room
}
export const testCage3 = {
    rowid: 3,
    location: "rck1-0003",
    cageNum: "0003",
    x: 0,
    y: 120,
    rack: "rck1",
    cagetype: testCageTypes1.cagetype,
    room: testRoom.room
}
export const testCage4 = {
    rowid: 4,
    location: "rck1-0004",
    cageNum: "0004",
    x: 120,
    y: 120,
    rack: "rck1",
    cagetype: testCageTypes1.cagetype,
    room: testRoom.room
}
export const testCage5 = {
    rowid: 5,
    location: "pen1-0001",
    cageNum: "0001",
    x: 0,
    y: 0,
    rack: "pen1",
    cagetype: testCageTypes2.cagetype,
    room: testRoom.room
}

export const testCage6 = {
    rowid: 6,
    location: "rck2-0001",
    cageNum: "0001",
    x: 0,
    y: 0,
    rack: "rck2",
    cagetype: testCageTypes1.cagetype,
    room: testRoom.room
}

export const testCagesInRoom = [testCage1, testCage2,testCage3,testCage4,testCage5,testCage6]

export const testRoomObj = {
    rowid: 1,
    location: "ab140-rd",
    type: "Room Divider",
    abbreviation: "rd",
    room: testRoom.room
}



/* If object type is caging then query the cages table for object id to get the cages in that rack,
    then add local coords to rack coords to get the correct coords of each cage.
   If object type is room then query the room objects table if needed. Since room objects don't use sub coords there is
   no need to do this if you are loading a layout. Just place the correct object at the location as it is in layout history
 */
export const testLayoutHistory: LayoutHistoryData[] = [
    {
        rowid: 1,
        objectId: testCage1.rack,
        objectType: "caging",
        startDate: "2024-10-22",
        endDate: null,
        x: 0,
        y: 0,
        scale: 1,
        room: testRoom.room
    },
    {
        rowid: 2,
        objectId: testRoomObj.location,
        objectType: "room",
        startDate: "2024-10-22",
        endDate: null,
        x: 300,
        y: 300,
        scale: 1,
        room: testRoom.room
    },
    {
        rowid: 3,
        objectId: testCage5.rack,
        objectType: "caging",
        startDate: "2024-10-22",
        endDate: null,
        x: 0,
        y: 0,
        scale: 1,
        room: testRoom.room
    },{
        rowid: 4,
        objectId: testCage6.rack,
        objectType: "caging",
        startDate: "2024-10-22",
        endDate: null,
        x: 0,
        y: 0,
        scale: 1,
        room: testRoom.room
    }]



export const testCageHistory = {
    rowid: 1,
    startDate: "2024-10-22",
    endDate: null,
    location: testCage1.location,
    leftDivider: testCageModifications[0].rowid,
    rightDivider: testCageModifications[0].rowid,
    flooring: testCageModifications[1].rowid,
    modification: testCageModifications[2].rowid
}
