import * as React from 'react';
import { FC, useEffect, useState } from 'react';
import '../../cageui.scss';
import { Room } from '../../types/typings';
import { ExpandedRooms, ListCage, ListRack, ListRoom } from '../../types/homeTypes';
import { labkeyActionSelectWithPromise } from '../../api/labkeyActions';
import { buildNewLocalRoom, fetchRoomData } from '../../utils/helpers';
import { useHomeNavigationContext } from '../../context/HomeNavigationContextManager';
import { useRoomContext } from '../../context/RoomContextManager';

export const RoomList: FC = () => {
    const {navigateTo} = useHomeNavigationContext();
    // keeps track of which rooms have already been fetched from layout_history
    const [expandedRooms, setExpandedRooms] = useState<ExpandedRooms>({});
    const [expandedRacks, setExpandedRacks] = useState<ListRack[]>([]);

    const [allRooms, setAllRooms] = useState<ListRoom[]>([]); // Stores all items fetched on load
    const [visibleRooms, setVisibleRooms] = useState<ListRoom[]>([]); // Items currently visible

    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
    };

    // Filter items based on search query
    useEffect(() => {
        if (searchQuery) {
            const filteredItems = allRooms.filter((item) =>
                item.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setVisibleRooms(filteredItems);
        } else {
            setVisibleRooms(allRooms);
        }
    }, [searchQuery, allRooms]);

    // Runs once after loadedRooms is filled with the rooms, adds to a list for easier display
    useEffect(() => {
        if (allRooms.length !== 0) {
            return;
        }
        labkeyActionSelectWithPromise({
            schemaName: 'ehr_lookups',
            queryName: 'rooms',
            columns: ['room']
        }).then((res) => {
            if (res.rowCount > 0) {
                const roomList: ListRoom[] = [];
                res.rows.forEach((row) => {
                    roomList.push({
                        name: row.room,
                        racks: null
                    });
                });
                setAllRooms(roomList);
            }
        });
    }, []);

    const toggleExpandRoom = async (roomName) => {

        // Check if room has been expanded yet, if not, fetch rack data for that room
        if (!(roomName in expandedRooms)) {
            const roomData = await fetchRoomData(roomName);
            let newRoom: Room;
            // room exists
            if (roomData.prevRoomData) {
                const [newLocalRoom, locs] = await buildNewLocalRoom(roomData.prevRoomData);
                if (newLocalRoom) {
                    newLocalRoom.layoutData = roomData.prevRoomData.layoutData;
                    newRoom = {...newLocalRoom};
                }
            }

            if (newRoom) {
                setAllRooms((prevRooms) => prevRooms.map((prevRoom) => {
                    // add racks to room state, only once when first clicked
                    if (prevRoom.name === roomName) {
                        const tempRacks: ListRack[] = [];
                        newRoom.rackGroups.forEach((rg) => {
                            rg.racks.forEach(r => {
                                r.cages.forEach(c => {
                                    const existingRack = tempRacks.find((rack) => rack.id === r.svgId);
                                    if (existingRack) {
                                        existingRack.cages.push({
                                            name: c.cageNum,
                                            id: c.svgId,
                                        });
                                    } else {
                                        tempRacks.push({
                                            id: r.svgId,
                                            name: `Rack-${r.itemId}`,
                                            cages: [{
                                                name: c.cageNum,
                                                id: c.svgId
                                            }],
                                        });
                                    }

                                });
                            });
                        });
                        return {
                            ...prevRoom,
                            racks: tempRacks,
                        };
                    }
                    return prevRoom;
                }));
            }
        }
        setExpandedRooms((prevExpandedRooms) => ({
            ...prevExpandedRooms,
            [roomName]: !prevExpandedRooms[roomName],
        }));

    };

    const toggleExpandRack = (roomId, rackId) => {
        const rackKey = `${roomId}_${rackId}`;
        setExpandedRacks((prevExpandedRacks) => ({
            ...prevExpandedRacks,
            [rackKey]: !prevExpandedRacks[rackKey],
        }));
    };

    const handleRoomClick = (room: ListRoom) => {
        navigateTo({selected: 'Room', room: room.name})
    };

    const handleRackClick = (room: ListRoom, rack: ListRack) => {
        navigateTo({selected: 'Rack', room: room.name, rack: rack.id});
    };

    const handleCageClick = (room: ListRoom, rack: ListRack, cage: ListCage) => {
        navigateTo({selected: 'Cage', room: room.name, rack: rack.id, cage: cage.id});
    };

    return (
        <div className={'room-list'}>
            <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                className={'room-search'}
                onChange={handleSearch}
            />
            <ul className={'room-list-items'}>
                {visibleRooms.map((room, index) => (
                    <div key={room.name} className={'room-dir-room-obj'}>
                        <div
                            onClick={() => handleRoomClick(room)}
                            className={`room-dir-header ${expandedRooms[room.name] ? 'open' : ''}`}
                        >
                            {room.name}
                            <span className="arrow" onClick={() => toggleExpandRoom(room.name)}></span>
                        </div>
                        {expandedRooms[room.name] && (
                            <ul>
                                {room?.racks?.map((rack) => (
                                    <li key={`${room.name}_${rack.id}`}>
                                        <div
                                            onClick={() => handleRackClick(room, rack)}
                                            className={`room-dir-rack-obj ${expandedRacks[`${room.name}_${rack.id}`] ? 'open' : ''}`}
                                        >
                                            {rack.name}
                                            <span className="arrow"
                                                  onClick={() => toggleExpandRack(room.name, rack.id)}></span>
                                        </div>
                                        {expandedRacks[`${room.name}_${rack.id}`] && (
                                            <ul>
                                                {rack.cages.map((cage) => (
                                                    <li key={`${room.name}_${rack.id}_${cage.id}`}>
                                                        <div
                                                            onClick={() => handleCageClick(room, rack, cage)}
                                                            className={'room-dir-cage-obj'}
                                                        >
                                                            {cage.name}
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
            </ul>
        </div>
    );
}