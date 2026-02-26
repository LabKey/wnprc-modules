import * as React from 'react';
import { FC, useEffect, useState } from 'react';
import '../../../cageui.scss';
import { useRoomContext } from '../../../context/RoomContextManager';
import { getCageNumDisplay, sortCagesByCageNumber } from '../../../utils/homeHelpers';
import { Cage } from '../../../types/typings';

export const CagesOverview: FC = () => {
    const {selectedRack} = useRoomContext();
    const [sortedCages, setSortedCages] = useState<Cage[]>([]);

    useEffect(() => {
        setSortedCages(sortCagesByCageNumber(selectedRack.cages));
    }, [selectedRack]);

    return (
        <div className="cages-overview-container">
            {sortedCages.map((cage, idx) => (
                <div className={"cage-overview-cage"} key={`cage-overview-cage-${idx}`}>
                    <h2 key={`cage-title-${idx}`}>{getCageNumDisplay(cage.cageNum)}</h2>
                    <div>Animal Placeholder</div>
                    <div>Animal Placeholder</div>
                    <div>Animal Placeholder</div>
                </div>
            ))}
        </div>
    )
}