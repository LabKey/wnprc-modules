/*
 *
 *  * Copyright (c) 2026 Board of Regents of the University of Wisconsin System
 *  *
 *  * Licensed under the Apache License, Version 2.0 (the "License");
 *  * you may not use this file except in compliance with the License.
 *  * You may obtain a copy of the License at
 *  *
 *  *     http://www.apache.org/licenses/LICENSE-2.0
 *  *
 *  * Unless required by applicable law or agreed to in writing, software
 *  * distributed under the License is distributed on an "AS IS" BASIS,
 *  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  * See the License for the specific language governing permissions and
 *  * limitations under the License.
 *
 */

import * as React from 'react';
import { FC, useEffect, useRef, useState } from 'react';
import '../../cageui.scss';
import { Room } from '../../types/typings';
import { ExpandedRooms, ListCage, ListRack, ListRoom } from '../../types/homeTypes';
import { labkeyActionSelectWithPromise } from '../../api/labkeyActions';
import { buildNewLocalRoom, fetchRoomData } from '../../utils/helpers';
import { useHomeNavigationContext } from '../../context/HomeNavigationContextManager';
import { ActionURL, Filter } from '@labkey/api';

export const RoomList: FC = () => {
    const {navigateTo, selectedPage, setIsNavLoading} = useHomeNavigationContext();
    // keeps track of which rooms have already been fetched from layout_history
    const [expandedRooms, setExpandedRooms] = useState<ExpandedRooms>({});
    const [expandedRacks, setExpandedRacks] = useState<Record<string, boolean>>({});

    const [allRooms, setAllRooms] = useState<ListRoom[]>([]); // Stores all items fetched on load
    const [visibleRooms, setVisibleRooms] = useState<ListRoom[]>([]); // Items currently visible

    const [searchQuery, setSearchQuery] = useState('');

    const roomRefs = useRef<Record<string, HTMLDivElement>>({});
    const listContainerRef = useRef<HTMLUListElement>(null);

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
            columns: ['room'],
            filterArray: [Filter.create('room', "template", Filter.Types.CONTAINS_NONE_OF)]
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

    // Auto-expand and scroll based on URL parameters
    useEffect(() => {
        const roomName = ActionURL.getParameter("room");
        const rackId = ActionURL.getParameter("rack");

        if (roomName) {
            if (!expandedRooms[roomName]) {
                toggleExpandRoom(roomName);
            }

            if (rackId) {
                const rackKey = `${roomName}_${rackId}`;
                if (!expandedRacks[rackKey]) {
                    setExpandedRacks(prev => ({
                        ...prev,
                        [rackKey]: true
                    }));
                }
            }

            // Scroll room into view
            if (roomRefs.current[roomName] && listContainerRef.current) {
                const container = listContainerRef.current;
                const element = roomRefs.current[roomName];

                // Use a short timeout to ensure the DOM has updated (expanded) before we calculate the offset
                setTimeout(() => {
                    if (element && container) {
                        const containerRect = container.getBoundingClientRect();
                        const elementRect = element.getBoundingClientRect();
                        // elementRect.top is the distance from viewport top to element top
                        // containerRect.top is the distance from viewport top to container top
                        // relativeTop is the distance from container top to element top within the scrollable area
                        const relativeTop = elementRect.top - containerRect.top + container.scrollTop;

                        container.scrollTo({
                            top: relativeTop,
                            behavior: 'auto'
                        });
                    }
                }, 100);
            }
        }
    }, [selectedPage, allRooms, visibleRooms]);

    const handleRoomClick = (room: ListRoom) => {
        setIsNavLoading(true);
        navigateTo({selected: 'Room', room: room.name})
    };

    const handleRackClick = (room: ListRoom, rack: ListRack) => {
        setIsNavLoading(true);
        navigateTo({selected: 'Rack', room: room.name, rack: rack.id});
    };

    const handleCageClick = (room: ListRoom, rack: ListRack, cage: ListCage) => {
        setIsNavLoading(true);
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
            <ul className={'room-list-items'} ref={listContainerRef}>
                {visibleRooms.map((room, index) => (
                    <div
                        key={room.name}
                        className={'room-dir-room-obj'}
                        ref={(el) => {
                            if (el) roomRefs.current[room.name] = el;
                        }}
                    >
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