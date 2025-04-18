import * as React from 'react';
import { FC, useEffect, useState } from 'react';
import '../../../cageui.scss';
import { useHomeContext } from '../../../context/HomeContextManager';
import { findRackInGroup } from '../../../utils/LayoutEditorHelpers';
import { Cage, Rack, RackGroup, RackStringType, RackTypes } from '../../../types/typings';
import { findConnectedCages, findConnectedRacks } from '../../../utils/homeHelpers';
import { Direction, SelectedMods } from '../../../types/homeTypes';
import { ModificationSelect } from './ModificationSelect';
import { parseRoomItemType, stringToRoomItem } from '../../../utils/helpers';
import { Button } from 'react-bootstrap';

export const RackModifications: FC = () => {
    const {selectedPage, selectedRoom, selectedRack, selectedRackMods} = useHomeContext();
    const [rackGroup, setRackGroup] = useState<RackGroup>(null);
    const [connectedCages, setConnectedCages] = useState<[Cage, Direction, Cage][]>(null);
    const [aloneCages, setAloneCages] = useState<Cage[]>(null);
    const [connectedRacks, setConnectedRacks] = useState<[[Rack, Cage], Direction, [Rack, Cage]][]>(null);

    useEffect(() => {
        console.log("Room: ", selectedRoom);
        console.log("Rack: ", selectedRack);
        console.log("Page: ", selectedPage);
        console.log("RackGroup: ", rackGroup);
        console.log("Rack Mods: ", selectedRackMods);
    }, [selectedPage, rackGroup, selectedRack, selectedRackMods]);

    useEffect(() => {
        console.log("Connected Cages: ", connectedCages);
        console.log("Connected Racks: ", connectedRacks);
    }, [connectedRacks, connectedCages]);

    // Find possible connects
    useEffect(() => {
        if(!selectedRack) return;
        const connections = findConnectedCages(selectedRack);
        setConnectedCages(connections);
        setRackGroup(findRackInGroup(selectedRack.itemId, selectedRoom.rackGroups).rackGroup);
    }, [selectedRack]);

    useEffect(() => {
        if(!rackGroup) return;
        const connections = findConnectedRacks(rackGroup, selectedRack);
        let tempAloneCages: Cage[] = rackGroup.racks.flatMap(r => r.cages);
        // filter out cages that are in rack connections
        connections.forEach(group => {
            tempAloneCages = tempAloneCages.filter(c => c.cageNum !== group[0][1].cageNum);
            tempAloneCages = tempAloneCages.filter(c => c.cageNum !== group[2][1].cageNum);
        });
        // filter out cages that are in cage connections
        connectedCages.forEach(group => {
            tempAloneCages = tempAloneCages.filter(c => c.cageNum !== group[0].cageNum);
            tempAloneCages = tempAloneCages.filter(c => c.cageNum !== group[2].cageNum);
        });
        // filter out cages that are in the same rack group as a result from rack connections, but aren't in the current rack
        tempAloneCages = tempAloneCages.filter(c => selectedRack.cages.some(tc => tc.cageNum === c.cageNum));
        setConnectedRacks(connections);
        setAloneCages(tempAloneCages)
    }, [rackGroup, selectedRack, connectedCages]);

    const handleModSave = () => {
        console.log("Saving Mods");
    }

    return (
        <div className={"mod-container"}>
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
                                        type={stringToRoomItem(parseRoomItemType(cage.cageNum) as RackStringType) as RackTypes}
                                        cage={cage}
                                        rack={selectedRack}
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
                                        type={stringToRoomItem(parseRoomItemType(cages[2].cageNum) as RackStringType) as RackTypes}
                                        direction={cages[1]}
                                        cage={cages[2]}
                                        rack={selectedRack}
                                    />
                                </div>
                                <div className={"mod-table-column"} key={`adj-inside-dir-${idx}`}>
                                    {cages[1] === "left" || cages[1] === "right" ? `${cages[1]} of` : cages[1]}
                                </div>
                                <div className={"mod-table-column"} key={`adj-inside-${cages[0].cageNum}-${idx}`}>
                                    {cages[0].cageNum}
                                </div>
                                <div className={"mod-table-column"} key={`adj-inside-mod-right-${idx}`}>
                                    <ModificationSelect
                                        type={stringToRoomItem(parseRoomItemType(cages[0].cageNum) as RackStringType) as RackTypes}
                                        direction={cages[1]}
                                        cage={cages[0]}
                                        rack={selectedRack}
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
                                        type={pairs[2][0].type.type}
                                        direction={pairs[1]}
                                        cage={pairs[2][1]}
                                        rack={pairs[2][0]}
                                    />
                                </div>
                                <div className={"mod-table-column"} key={`adj-outside-dir-${idx}`}>
                                    {pairs[1] === "left" || pairs[1] === "right" ? `${pairs[1]} of` : pairs[1]}
                                </div>
                                <div className={"mod-table-column"} key={`adj-outside-rack-right${pairs[0][0].itemId} - ${idx}`}>
                                    {pairs[0][0].itemId}
                                </div>
                                <div className={"mod-table-column"} key={`adj-outside-cage-right${pairs[0][1].cageNum} - ${idx}`}>
                                    {pairs[0][1].cageNum}
                                </div>
                                <div className={"mod-table-column"} key={`adj-outside-mod-right-${idx}`}>
                                    <ModificationSelect
                                        type={pairs[0][0].type.type}
                                        direction={pairs[1]}
                                        cage={pairs[0][1]}
                                        rack={pairs[0][0]}
                                    />
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </div>
            <Button
                as={"input"}
                type={"button"}
                value={"Save"}
                disabled={false}
                onClick={handleModSave}
            />
        </div>
    );
}