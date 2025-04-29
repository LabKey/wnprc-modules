import * as React from 'react';
import { FC, useEffect, useState } from 'react';
import '../../cageui.scss';
import { selectDistinctRows } from '@labkey/components';
import { useHomeContext } from '../../context/HomeContextManager';
import { ExpandedRooms, ListRoom, ListCage, ListRack } from '../../types/homeTypes';
import { labkeyActionSelectWithPromise } from '../../api/labkeyActions';
import { Filter, Query } from '@labkey/api';
import { HomeContextType } from '../../types/homeContextTypes';
import {
    convertToTitleCase,
    defaultTypeToRackType, formatRackId,
    parseRoomItemNum,
    parseRoomItemType,
    roomItemToString
} from '../../utils/helpers';
import { CageNumber, DefaultRackId, DefaultRackTypes, RackTypes, RealRackId, RoomItemType } from '../../types/typings';

export const RoomList: FC = () => {
    const {setSelectedPage, loadedRooms } = useHomeContext();

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
        if(allRooms.length !== 0) return;
        const roomList: ListRoom[] = [];

        for (const [key,value] of Object.entries(loadedRooms)){
            roomList.push({
                name: key,
                racks: null
            })
        }
        setAllRooms(roomList);
    }, [loadedRooms]);

    const toggleExpandRoom = async (roomId) => {

        // Check if room has been expanded yet, if not, fetch rack data for that room
        if(!(roomId in expandedRooms)){
            const racks = await labkeyActionSelectWithPromise({
                schemaName: "cageui",
                queryName: "layout_history",
                filterArray: [
                    Filter.create('room', roomId, Filter.Types.EQUALS),
                    Filter.create('end_date', null, Filter.Types.ISBLANK),
                    Filter.create('cage', null, Filter.Types.NONBLANK)],
                sort: "rack_group"
            });

            if(racks.rowCount > 0){
                console.log("Racks: ", racks)
                setAllRooms((prevRooms) => prevRooms.map((room) => {
                    // add racks to room state, only once when first clicked
                    if(room.name === roomId){
                        const tempRacks: ListRack[] = [];
                        racks.rows.forEach((row) => {
                            const rackId: DefaultRackId | RealRackId = row.rack ? `rack-${row.rack}` : `default-rack-${JSON.parse(row.extra_context).rack.rackId}`;
                            const rackIdx = tempRacks.findIndex((rack) => rack.id === rackId);
                            const cageType = row.rack ? roomItemToString(row.object_type as RackTypes) : roomItemToString(defaultTypeToRackType(row.object_type as DefaultRackTypes));
                            // if rack was already added, just add cage, otherwise add rack and cage
                            if(rackIdx !== -1){
                                tempRacks[rackIdx] = {
                                    ...tempRacks[rackIdx],
                                    cages: [...tempRacks[rackIdx].cages, {
                                        id: `${cageType}-${parseInt(row.cage)}` as CageNumber,
                                    }]
                                }
                            }else{
                                tempRacks.push({
                                    id: rackId,
                                    cages: [{id: `${cageType}-${parseInt(row.cage)}` as CageNumber}],
                                });
                            }
                        })
                        return {
                            ...room,
                            racks: tempRacks,
                        }
                    }
                    return room;
                }))
            }
        }
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

    const handleRoomClick = (room: ListRoom) => {
        setSelectedPage({
            selected: "Room",
            room: room.name
        });
    }

    const handleRackClick = (room: ListRoom, rack: ListRack) => {
        console.log("Click: ", room, rack)
        setSelectedPage({
            selected: "Rack",
            room: room.name,
            rack: rack.id,
        });
    }

    const handleCageClick = (room: ListRoom, rack: ListRack, cage: ListCage) => {
        setSelectedPage({
            selected: "Cage",
            room: room.name,
            rack: rack.id,
            cage: cage.id
        });
    }

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
                    <div key={room.name} className={"room-dir-room-obj"}>
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
                                            {formatRackId(rack.id)}
                                            <span className="arrow" onClick={() => toggleExpandRack(room.name, rack.id)}></span>
                                        </div>
                                        {expandedRacks[`${room.name}_${rack.id}`] && (
                                            <ul>
                                                {rack.cages.map((cage) => (
                                                    <li key={`${room.name}_${rack.id}_${cage.id}`}>
                                                        <div
                                                            onClick={() => handleCageClick(room, rack, cage)}
                                                            className={"room-dir-cage-obj"}
                                                        >
                                                            {convertToTitleCase(parseRoomItemType(cage.id))} {parseRoomItemNum(cage.id)}
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