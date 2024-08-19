import * as React from 'react';
import { FC, useEffect, useState } from 'react';
import '../cageui.scss';
import {selectDistinctRows} from '@labkey/components';
import { useRoomContext } from './ContextManager';

export const RoomList: FC = () => {
    const [rooms, setRooms] = useState();
    const [expandedRooms, setExpandedRooms] = useState({});
    const [expandedRacks, setExpandedRacks] = useState({});
    const {setSelectedPage} = useRoomContext();

    const roomData = [
        {
            id: 1,
            name: 'ab140',
            racks: [
                {
                    id: 1,
                    name: '1',
                    cages: [
                        { id: 1, name: "1" },
                        { id: 2, name: "2" },
                        { id: 3, name: "3" },
                        { id: 4, name: "4" },
                    ],
                },
                {
                    id: 2,
                    name: '2',
                    cages: [
                        { id: 1, name: "5" },
                        { id: 2, name: "6" },
                        { id: 3, name: "7" },
                        { id: 4, name: "8" },
                    ],
                },
            ],
        },
        {
            id: 2,
            name: 'ab142',
            racks: [
                {
                    id: 1,
                    name: '1',
                    cages: [
                        { id: 1, name: "1" },
                        { id: 2, name: "2" },
                        { id: 3, name: "3" },
                        { id: 4, name: "4" },
                    ],
                },
                {
                    id: 2,
                    name: '2',
                    cages: [
                        { id: 1, name: "5" },
                        { id: 2, name: "6" },
                        { id: 3, name: "7" },
                        { id: 4, name: "8" },
                    ],
                },
            ],
        },
    ];

    useEffect(() => {
        selectDistinctRows({schemaName: "ehr_lookups", queryName: "rooms", column: "room"}).then((d) => {
            console.log(d);
        }).catch(e => {
            console.log(e)
        });
    }, []);

    const toggleExpandRoom = (roomId) => {
        setExpandedRooms((prevExpandedRooms) => ({
            ...prevExpandedRooms,
            [roomId]: !prevExpandedRooms[roomId],
        }));
    };

    const toggleExpandRack = (roomId, rackId) => {
        const rackKey = `${roomId}_${rackId}`;
        setExpandedRacks((prevExpandedRacks) => ({
            ...prevExpandedRacks,
            [rackKey]: !prevExpandedRacks[rackKey],
        }));
    };




    return (
        <div className="room-dir">
            {roomData.map((room) => (
                <div key={room.id} className={"room-dir-room-obj"}>
                    <div
                        onClick={() => setSelectedPage({mainView: "Room", subViewId: room.name})}
                        className={`room-dir-header ${expandedRooms[room.id] ? 'open' : ''}`}
                    >
                        {room.name}
                        <span className="arrow" onClick={() => toggleExpandRoom(room.id)}></span>
                    </div>
                    {expandedRooms[room.id] && (
                        <ul>
                            {room.racks.map((rack) => (
                                <li key={`${room.name}_${rack.id}`}>
                                    <div
                                        onClick={() => setSelectedPage({mainView: "Rack", subViewId: `${room.name}_${rack.id}`})}
                                        className={`room-dir-rack-obj ${expandedRacks[`${room.id}_${rack.id}`] ? 'open' : ''}`}
                                    >
                                        Rack {rack.name}
                                        <span className="arrow" onClick={() => toggleExpandRack(room.id, rack.id)}></span>
                                    </div>
                                    {expandedRacks[`${room.id}_${rack.id}`] && (
                                        <ul>
                                            {rack.cages.map((cage) => (
                                                <li key={`${room.name}_${rack.id}_${cage.id}`}>
                                                    <div
                                                        onClick={() => setSelectedPage({mainView: "Cage", subViewId: `${room.name}_${rack.id}_${cage.id}`})}
                                                        className={"room-dir-cage-obj"}
                                                    >
                                                        Cage {cage.name}
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            ))}
        </div>
    );
}