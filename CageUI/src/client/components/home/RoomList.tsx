import * as React from 'react';
import { FC, useCallback, useEffect, useState } from 'react';
import '../../cageui.scss';
import _ from 'lodash';
import { selectDistinctRows, selectRows } from '@labkey/components';
import { useHomeContext } from '../../context/HomeContextManager';
import { ExpandedRooms, Room, RoomRack } from '../../types/homeTypes';
import { labkeyActionSelectWithPromise } from '../../api/labkeyActions';
import { Filter } from '@labkey/api';

export const RoomList: FC = () => {
    const [rooms, setRooms] = useState();
    const [expandedRooms, setExpandedRooms] = useState<ExpandedRooms>({});
    const [expandedRacks, setExpandedRacks] = useState<RoomRack[]>([]);
    const {setSelectedPage} = useHomeContext();

    const [allRooms, setAllRooms] = useState<Room[]>([]); // Stores all items fetched on load
    const [visibleRooms, setVisibleRooms] = useState<Room[]>([]); // Items currently visible
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const itemsPerPage = 20; // Number of items to load per scroll

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
        setPage(1);
    };

    useEffect(() => {
        console.log("Expanded Rooms: ", expandedRooms);
        console.log("Expanded Racks: ", expandedRacks);
    }, [expandedRooms, expandedRacks]);

    // Filter items based on search query
    useEffect(() => {
        if (searchQuery) {
            const filteredItems = allRooms.filter((item) =>
                item.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setVisibleRooms(filteredItems.slice(0, itemsPerPage * page)); // Reset visible items
            setHasMore(filteredItems.length > itemsPerPage * page);
        } else {
            setVisibleRooms(allRooms.slice(0, itemsPerPage * page));
            setHasMore(allRooms.length > itemsPerPage * page);
        }
    }, [searchQuery, page, allRooms]);

    const handleScroll = useCallback(
        _.throttle(() => {
            if (
                window.innerHeight + document.documentElement.scrollTop !==
                document.documentElement.offsetHeight ||
                loading ||
                !hasMore
            ) {
                return;
            }
            setPage((prevPage) => prevPage + 1);
        }, 300),
        [loading, hasMore]
    );

    useEffect(() => {
        selectDistinctRows({schemaName: "ehr_lookups", queryName: "rooms", column: "room"}).then((d) => {
            console.log(d);
            if(d.values.length > 0){
                const tempRooms: Room[] = [];
                for (let value of d.values) {
                    tempRooms.push({name: value})
                }
                setAllRooms(tempRooms);
            }else{
                console.log("No Rooms Found.")
            }
        }).catch(e => {
            console.log(e)
        });
    }, []);

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);


    const toggleExpandRoom = async (roomId) => {

        // Check if room has been expanded yet, if not, fetch rack data for that room
        if(!(roomId in expandedRooms)){
            console.log("Not expanded yet, fetch: ", roomId);
            const racks = await labkeyActionSelectWithPromise({
                schemaName: "cageui",
                queryName: "layout_history",
                filterArray: [
                    Filter.create('room', roomId, Filter.Types.EQUALS),
                    Filter.create('end_date', null, Filter.Types.ISBLANK),
                    Filter.create('rack', null, Filter.Types.NONBLANK)]
            });
            console.log("Racks: ", racks);
            if(racks.rowCount > 0){
                //TODO set racks into room state
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

    const handleRoomClick = (room: Room) => {
        console.log("Room: ", room, expandedRooms);
        //setSelectedPage({mainView: "Room", subViewId: room.name});
        toggleExpandRoom(room.name);
    }



    return (
        <div>
            <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={handleSearch}
            />
            <ul>
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
                                            onClick={() => setSelectedPage({mainView: "Rack", subViewId: `${room.name}_${rack.id}`})}
                                            className={`room-dir-rack-obj ${expandedRacks[`${room.name}_${rack.id}`] ? 'open' : ''}`}
                                        >
                                            Rack {rack.name}
                                            <span className="arrow" onClick={() => toggleExpandRack(room.name, rack.id)}></span>
                                        </div>
                                        {expandedRacks[`${room.name}_${rack.id}`] && (
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
            </ul>
            {loading && <p>Loading...</p>}
            {!hasMore && <p>No more items</p>}
        </div>
    );
}