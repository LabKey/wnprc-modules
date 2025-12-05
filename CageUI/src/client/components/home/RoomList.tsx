import * as React from 'react';
import { FC, useEffect, useState } from 'react';
import '../../cageui.scss';
import { ExpandedRooms, ListCage, ListRack, ListRoom } from '../../types/homeTypes';
import { labkeyActionSelectWithPromise } from '../../api/labkeyActions';
import { Filter, Utils } from '@labkey/api';
import {
    convertToTitleCase,
    defaultTypeToRackType,
    formatRackId, generateCageId,
    parseRoomItemNum,
    parseRoomItemType,
    roomItemToString
} from '../../utils/helpers';
import { CageNumber, DefaultRackTypes, RackTypes } from '../../types/typings';
import { useHomeNavigationContext } from '../../context/HomeNavigationContextManager';
import { useRoomContext } from '../../context/RoomContextManager';

export const RoomList: FC = () => {
    const {navigateTo, navigateToRoom} = useHomeNavigationContext();
    const {switchToRoom} = useRoomContext();
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
        labkeyActionSelectWithPromise({schemaName: "ehr_lookups", queryName: "rooms", columns: ["room"]}).then((res) => {
            if(res.rowCount > 0){
                const roomList: ListRoom[] = [];
                res.rows.forEach((row) => {
                    roomList.push({
                        name: row.room,
                        racks: null
                    })
                })
                setAllRooms(roomList);
            }
        });
    }, []);

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
                setAllRooms((prevRooms) => prevRooms.map((room) => {
                    // add racks to room state, only once when first clicked
                    if(room.name === roomId){
                        const tempRacks: ListRack[] = [];
                        racks.rows.forEach((row) => {
                            // TODO Fix rackiD
                            const rackId: number = 0;//row.rack ? `rack-${row.rack}` : `default-rack-${JSON.parse(row.extra_context).rack.rackId}`;
                            const rackIdx = tempRacks.findIndex((rack) => rack.id === rackId);
                            const cageObjId = Utils.generateUUID().toUpperCase();
                            const cageType = row.rack ? roomItemToString(row.object_type as RackTypes) : roomItemToString(defaultTypeToRackType(row.object_type as DefaultRackTypes));
                            // if rack was already added, just add cage, otherwise add rack and cage
                            if(rackIdx !== -1){
                                tempRacks[rackIdx] = {
                                    ...tempRacks[rackIdx],
                                    cages: [...tempRacks[rackIdx].cages, {
                                        name: `${cageType}-${parseInt(row.cage)}` as CageNumber,
                                        id: generateCageId(cageObjId),
                                    }]
                                }
                            }else{
                                tempRacks.push({
                                    id: rackId,
                                    cages: [{
                                        name: `${cageType}-${parseInt(row.cage)}` as CageNumber,
                                        id: generateCageId(cageObjId)
                                    }],
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
        console.log("Click: ", room)
        navigateToRoom(room.name, switchToRoom);
    }

    const handleRackClick = (room: ListRoom, rack: ListRack) => {
        console.log("Click: ", room, rack)
        navigateTo("Rack", {room: room.name, rack: rack.id});
    }

    const handleCageClick = (room: ListRoom, rack: ListRack, cage: ListCage) => {
        navigateTo("Cage", {room: room.name, rack: rack.id, cage: cage.id});
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
                                            {formatRackId(rack.id.toString())}
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