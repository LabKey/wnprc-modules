// @ts-nocheck

import * as React from 'react';
import { FC, useEffect, useState } from 'react';
import '../../../cageui.scss';
import { useHomeContext } from '../../../context/HomeContextManager';
import { findRackInGroup } from '../../../utils/LayoutEditorHelpers';
import { Cage, CageDirection, Rack, RackGroup } from '../../../types/typings';
import { getLocationDirection } from '../../../utils/homeHelpers';
import {findConnectedCages, findConnectedRacks} from '../../../utils/helpers';
import { ModificationSelect } from './ModificationSelect';
import { Button } from 'react-bootstrap';
import { CurrentRackLayout } from './CurrentRackLayout';

export const RackModifications: FC = () => {
    const {selectedPage, selectedRoom, selectedRack} = useHomeContext();
    const [rackGroup, setRackGroup] = useState<RackGroup>(null);
    const [connectedCages, setConnectedCages] = useState<[Cage, CageDirection, Cage][]>(null);
    const [aloneCages, setAloneCages] = useState<Cage[]>(null);
    const [connectedRacks, setConnectedRacks] = useState<[[Rack, Cage], CageDirection, [Rack, Cage]][]>(null);

    // Find possible connects
    useEffect(() => {
        if(!selectedRack) return;
        const currGroup = findRackInGroup(selectedRack.itemId, selectedRoom.rackGroups).rackGroup;
        const connections = findConnectedCages(selectedRack,undefined);
        //setConnectedCages(connections);
        setRackGroup(currGroup);
    }, [selectedRack]);

    useEffect(() => {
        if(!rackGroup) return;
        const connections = findConnectedRacks(rackGroup, selectedRack);
        let tempAloneCages: Cage[] = rackGroup.racks.flatMap(r => r.cages);
        // filter out cages that are in rack connections
/*        connections.forEach(group => {
            tempAloneCages = tempAloneCages.filter(c => c.cageNum !== group[0][1].cageNum);
            tempAloneCages = tempAloneCages.filter(c => c.cageNum !== group[2][1].cageNum);
        });*/
        // filter out cages that are in cage connections
        connectedCages.forEach(group => {
            tempAloneCages = tempAloneCages.filter(c => c.cageNum !== group[0].cageNum);
            tempAloneCages = tempAloneCages.filter(c => c.cageNum !== group[2].cageNum);
        });
        // filter out cages that are in the same rack group as a result from rack connections, but aren't in the current rack
        tempAloneCages = tempAloneCages.filter(c => selectedRack.cages.some(tc => tc.cageNum === c.cageNum));
        //setConnectedRacks(connections);
        setAloneCages(tempAloneCages)
    }, [rackGroup, selectedRack, connectedCages]);

    const handleModSave = () => {
        console.log("Saving Mods");
    }

    const handleRemoveMod = () => {

    }

    const handleChangeMod = () => {

    }

    return (
        <div className={"mod-container"}>
            <div className={"mod-container-columns"}>
                <div className={"mod-container-column"}>
                    <div className={"mod-table-container"}>
                        <h2>Unconnected cages</h2>
                        <ul className={"mod-table"}>
                            <li className={"mod-table-row mod-table-header"}>
                                <div className={"mod-table-column"}>Cage</div>
                                <div className={"mod-table-column"}>Modification</div>
                            </li>
                            {aloneCages && aloneCages.map((cage, idx) => {
                                return (
                                    <li className={"mod-table-row"} key={`alone-row-${idx}`} >
                                        <div className={"mod-table-column"} key={`alone-${cage.cageNum}-${idx}`}>
                                            {cage.cageNum}
                                        </div>
                                        <div className={"mod-table-column"} key={`alone-mod-${idx}`}>
                                            <ModificationSelect
                                                removeMod={handleRemoveMod}
                                                changeMod={handleChangeMod}
                                            />
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>

                        <h2>Adjacent cages inside current rack</h2>
                        <ul className={"mod-table"}>
                            <li className={"mod-table-row mod-table-header"}>
                                <div className={"mod-table-column"}>Cage</div>
                                <div className={"mod-table-column"}>Modification</div>
                                <div className={"mod-table-column"}>Direction</div>
                                <div className={"mod-table-column"}>Cage</div>
                                <div className={"mod-table-column"}>Modification</div>
                            </li>
                            {connectedCages && connectedCages.map((cages, idx) => {
                                return (
                                    <li className={"mod-table-row"} key={`adj-inside-row-${idx}`} >
                                        <div className={"mod-table-column"} key={`adj-inside-${cages[2].cageNum}-${idx}`}>
                                            {cages[2].cageNum}
                                        </div>
                                        <div className={"mod-table-column"} key={`adj-inside-mod-left-${idx}`}>
                                            <ModificationSelect
                                                directionCategory={getLocationDirection(cages[1])}
                                                removeMod={handleRemoveMod}
                                                changeMod={handleChangeMod}
                                            />
                                        </div>
                                        <div className={"mod-table-column"} key={`adj-inside-dir-${idx}`}>
                                            {cages[1] === CageDirection.Left || cages[1] === CageDirection.Right ? `${cages[1]} of` : cages[1]}
                                        </div>
                                        <div className={"mod-table-column"} key={`adj-inside-${cages[0].cageNum}-${idx}`}>
                                            {cages[0].cageNum}
                                        </div>
                                        <div className={"mod-table-column"} key={`adj-inside-mod-right-${idx}`}>
                                            <ModificationSelect
                                                directionCategory={getLocationDirection(cages[1])}
                                                removeMod={handleRemoveMod}
                                                changeMod={handleChangeMod}
                                            />
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>

                        <h2>
                            Adjacent cages outside current rack
                        </h2>
                        <ul className={"mod-table"}>
                            <li className={"mod-table-row mod-table-header"}>
                                <div className={"mod-table-column"}>Rack</div>
                                <div className={"mod-table-column"}>Cage</div>
                                <div className={"mod-table-column"}>Modification</div>
                                <div className={"mod-table-column"}>Direction</div>
                                <div className={"mod-table-column"}>Rack</div>
                                <div className={"mod-table-column"}>Cage</div>
                                <div className={"mod-table-column"}>Modification</div>
                            </li>
                            {connectedRacks && connectedRacks.map((pairs, idx) => {
                                return (
                                    <li className={"mod-table-row"} key={`adj-outside-row-${idx}`} >
                                        <div className={"mod-table-column"} key={`adj-outside-rack-left-${pairs[2][0].itemId} - ${idx}`}>
                                            {pairs[2][0].itemId}
                                        </div>
                                        <div className={"mod-table-column"} key={`adj-outside-cage-left-${pairs[2][1].cageNum}-${idx}`}>
                                            {pairs[2][1].cageNum}
                                        </div>
                                        <div className={"mod-table-column"} key={`adj-outside-mod-left-${idx}`}>
                                            <ModificationSelect
                                                directionCategory={getLocationDirection(pairs[1])}
                                                removeMod={handleRemoveMod}
                                                changeMod={handleChangeMod}
                                            />
                                        </div>
                                        <div className={"mod-table-column"} key={`adj-outside-dir-${idx}`}>
                                            {pairs[1] === CageDirection.Left || pairs[1] === CageDirection.Right ? `${pairs[1]} of` : pairs[1]}
                                        </div>
                                        <div className={"mod-table-column"} key={`adj-outside-rack-right${pairs[0][0].itemId} - ${idx}`}>
                                            {pairs[0][0].itemId}
                                        </div>
                                        <div className={"mod-table-column"} key={`adj-outside-cage-right${pairs[0][1].cageNum} - ${idx}`}>
                                            {pairs[0][1].cageNum}
                                        </div>
                                        <div className={"mod-table-column"} key={`adj-outside-mod-right-${idx}`}>
                                            <ModificationSelect
                                                directionCategory={getLocationDirection(pairs[1])}
                                                removeMod={handleRemoveMod}
                                                changeMod={handleChangeMod}
                                            />
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </div>
                <div className={"mod-container-column"}>
                </div>
            </div>

            <div className={"mod-container-row"}>
                <Button
                    as={"input"}
                    type={"button"}
                    value={"Save"}
                    disabled={false}
                    onClick={handleModSave}
                />
            </div>
        </div>
    );
}