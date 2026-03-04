import * as React from 'react';
import { FC, useEffect, useState } from 'react';
import '../../../cageui.scss';
import { getCageNumDisplay, sortCagesByCageNumber } from '../../../utils/homeHelpers';
import { Cage } from '../../../types/typings';
import { useHomeNavigationContext } from '../../../context/HomeNavigationContextManager';

export const CagesOverview: FC = () => {
    const {selectedRack} = useHomeNavigationContext();
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