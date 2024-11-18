import {
    CageType,
    EHRCage,
    EHRRackType,
    EHRRoom,
    LayoutHistoryData,
    RackTypes,
    RoomObjectTypes
} from '../components/typings';

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

export const testRoom: EHRRoom = {
    rowid: 68,
    room: "ab140",
    building: "",
    area: "AB-New",
    housingType: null,
    housingCondition: null,
    maxCages: 26
}

export const testCageTypes1: EHRRackType = {
    rowid: 3,
    name: "cage-at-6.7",
    type: RackTypes.Cage,
    manufacturer: CageType.Allentown,
    length: 31.0,
    width: 31.25,
    height: 33.0,
    sqft: 6.7,
    supportsTunnel: true,
    abbreviation: "at",
    description: "6.7 sq ft allentown cage"
}

export const testCageTypes2: EHRRackType = {
    rowid: 4,
    name: "pen-uk-44",
    type: RackTypes.Pen,
    manufacturer: CageType.Unknown,
    length: 122.0,
    width: 52.0,
    height: 98.5,
    sqft: 44.0,
    supportsTunnel: false,
    abbreviation: "uk",
    description: "44 sq ft pen"
}

export const testCage1: EHRCage = {
    rowid: 1,
    location: "rck1-1",
    position: "top",
    cageNum: "0001",
    rackNum: 1,
    x: 0,
    y: 0,
    rack: "rck1",
    cagetype: testCageTypes1,
    room: testRoom.room
}
export const testCage2: EHRCage = {
    rowid: 2,
    location: "rck1-2",
    position: "top",
    cageNum: "0002",
    rackNum: 2,
    x: 120,
    y: 0,
    rack: "rck1",
    cagetype: testCageTypes1,
    room: testRoom.room
}
export const testCage3: EHRCage = {
    rowid: 3,
    location: "rck1-3",
    position: "bottom",
    cageNum: "0003",
    rackNum: 3,
    x: 0,
    y: 120,
    rack: "rck1",
    cagetype: testCageTypes1,
    room: testRoom.room
}
export const testCage4: EHRCage = {
    rowid: 4,
    location: "rck1-4",
    position: "bottom",
    cageNum: "0004",
    rackNum: 4,
    x: 120,
    y: 120,
    rack: "rck1",
    cagetype: testCageTypes1,
    room: testRoom.room
}
export const testCage5: EHRCage = {
    rowid: 5,
    location: "pen1-1",
    position: "none",
    cageNum: "0001",
    rackNum: 1,
    x: 0,
    y: 0,
    rack: "pen1",
    cagetype: testCageTypes2,
    room: testRoom.room
}

export const testCage6: EHRCage = {
    rowid: 6,
    location: "rck2-1",
    position: "none",
    cageNum: "0005",
    rackNum: 1,
    x: 0,
    y: 0,
    rack: "rck2",
    cagetype: testCageTypes1,
    room: testRoom.room
}

export const testCagesInRoom = [testCage1, testCage2,testCage3,testCage4,testCage5,testCage6]

export const testRoomObj = {
    rowid: 1,
    type: "Door",
    abbreviation: "d",
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
        objectType: RackTypes.Cage,
        startDate: "2024-10-22",
        endDate: null,
        x: 0,
        y: 0,
        scale: 1,
        room: testRoom.room
    },
    {
        rowid: 2,
        objectId: `${testRoomObj.rowid}`,
        objectType: RoomObjectTypes.Door,
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
        objectType: RackTypes.Pen,
        startDate: "2024-10-22",
        endDate: null,
        x: 0,
        y: 0,
        scale: 1,
        room: testRoom.room
    },{
        rowid: 4,
        objectId: testCage6.rack,
        objectType: RackTypes.Cage,
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