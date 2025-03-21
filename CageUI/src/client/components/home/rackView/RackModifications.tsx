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
    const {selectedPage, selectedRoom, selectedRack} = useHomeContext();
    const [rackGroup, setRackGroup] = useState<RackGroup>(null);
    const [connectedCages, setConnectedCages] = useState<[Cage, Direction, Cage][]>(null);
    const [connectedRacks, setConnectedRacks] = useState<[[Rack, Cage], Direction, [Rack, Cage]][]>(null);
    const [mods, setMods] = useState<SelectedMods>([]);

    useEffect(() => {
        console.log("Room: ", selectedRoom);
        console.log("Rack: ", selectedRack);
        console.log("Page: ", selectedPage);
        console.log("RackGroup: ", rackGroup);
    }, [selectedPage, rackGroup, selectedRack]);

    useEffect(() => {
        console.log("Connected Cages: ", connectedCages);
        console.log("Connected Racks: ", connectedRacks);
    }, [connectedRacks, connectedCages]);

    // Find possible connects
    useEffect(() => {
        if(!selectedRack) return;
        setConnectedCages(findConnectedCages(selectedRack));
        setRackGroup(findRackInGroup(selectedRack.itemId, selectedRoom.rackGroups).rackGroup);
    }, [selectedRack]);

    useEffect(() => {
        if(!rackGroup) return;
        setConnectedRacks(findConnectedRacks(rackGroup, selectedRack));
    }, [rackGroup, selectedRack]);

    const handleModSave = () => {

    }

    return (
        <div className={"mod-container"}>
            <div className={"mod-table-container"}>
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
                            <li className={"mod-table-row"} key={`table-row-${idx}`} >
                                <div className={"mod-table-column"} key={`${cages[2].cageNum} - ${idx}`}>
                                    {cages[2].cageNum}
                                </div>
                                <div className={"mod-table-column"} key={`mod-${idx}`}>
                                    <ModificationSelect
                                        type={stringToRoomItem(parseRoomItemType(cages[2].cageNum) as RackStringType) as RackTypes}
                                        direction={cages[1]}
                                    />
                                </div>
                                <div className={"mod-table-column"} key={`dir-${idx}`}>
                                    {cages[1] === "left" || cages[1] === "right" ? `${cages[1]} of` : cages[1]}
                                </div>
                                <div className={"mod-table-column"} key={`${cages[0].cageNum} - ${idx}`}>
                                    {cages[0].cageNum}
                                </div>
                                <div className={"mod-table-column"} key={`mod-${idx}`}>
                                    <ModificationSelect
                                        type={stringToRoomItem(parseRoomItemType(cages[0].cageNum) as RackStringType) as RackTypes}
                                        direction={cages[1]}
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
                            <li className={"mod-table-row"} key={`table-row-${idx}`} >
                                <div className={"mod-table-column"} key={`${pairs[2][0].itemId} - ${idx}`}>
                                    {pairs[2][0].itemId}
                                </div>
                                <div className={"mod-table-column"} key={`${pairs[2][1].cageNum}- ${idx}`}>
                                    {pairs[2][1].cageNum}
                                </div>
                                <div className={"mod-table-column"} key={`mod-${idx}`}>
                                    <ModificationSelect
                                        type={pairs[2][0].type.type}
                                        direction={pairs[1]}
                                    />
                                </div>
                                <div className={"mod-table-column"} key={`dir-${idx}`}>
                                    {pairs[1] === "left" || pairs[1] === "right" ? `${pairs[1]} of` : pairs[1]}
                                </div>
                                <div className={"mod-table-column"} key={`${pairs[0][0].itemId} - ${idx}`}>
                                    {pairs[0][0].itemId}
                                </div>
                                <div className={"mod-table-column"} key={`${pairs[0][1].cageNum} - ${idx}`}>
                                    {pairs[0][1].cageNum}
                                </div>
                                <div className={"mod-table-column"} key={`mod- ${idx}`}>
                                    <ModificationSelect
                                        type={pairs[0][0].type.type}
                                        direction={pairs[1]}
                                    />
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </div>
            <Button
                title={"Save"}
                disabled={false}
                onClick={handleModSave}
            />
        </div>
    );
}