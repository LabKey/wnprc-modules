import * as React from 'react';
import { FC, useEffect, useState } from 'react';
import '../../../cageui.scss';
import { CageWithMods, ModLocations, ModTypes, Rack } from '../../../types/typings';
import { SelectRowsOptions } from '@labkey/api/dist/labkey/query/SelectRows';
import { labkeyActionSelectWithPromise } from '../../../api/labkeyActions';
import { EHRCageMods } from '../../../types/homeTypes';
import { Option } from '@labkey/components';
import { ModificationSelect } from '../rackView/ModificationSelect';
import { getLocationDirection } from '../../../utils/homeHelpers';
import { useHomeContext } from '../../../context/HomeContextManager';

interface ModificationEditorTableProps {
    cage: CageWithMods;
    rack: Rack;
    onModAdd: (location: ModLocations, subsectionId: number) => void;
    onModDelete: (location: ModLocations, locId: number, subId: number) => void;
    onModChange: (location: ModLocations, locId: number, subId: number, newMod: ModTypes) => void;
}

/*
    Context menu for room item. Renders differently depending on assigned type and passed in components.

 */
export const ModificationEditorTable: FC<ModificationEditorTableProps> = (props) => {
    const {cage, onModAdd, onModDelete, onModChange, rack} = props;
    const [allCageMods, setAllCageMods] = useState<EHRCageMods>(null);

    const [options, setOptions] = useState<Option<ModTypes>[]>(null);


    useEffect(() => {
        const config: SelectRowsOptions = {
            schemaName: 'ehr_lookups',
            queryName: 'cageui_modifications',
            columns: ['rowid', 'value', 'title', 'category']
        }
        labkeyActionSelectWithPromise(config).then((result) => {
            const newMods = {};
            const newOptions = [];
            if(result.rowCount > 0){
                result.rows.forEach((row) => {
                    newMods[(row.value as ModTypes)] = {
                        category: row.category,
                        rowid: row.rowid,
                        title: row.title,
                    }
                    newOptions.push({label: row.title, value: row.value as ModTypes});
                })
                setAllCageMods(newMods as EHRCageMods);
                setOptions(newOptions)
            }
        });
    }, []);

    const handleAddNewMod = (location: ModLocations, subId: number) => {
        onModAdd(location, subId);
    }

    const handleRemoveMod = (location: ModLocations, locId: number, subId: number) => {
        onModDelete(location, locId, subId)
    }

    const handleModChange = (location: ModLocations, locId: number, subId: number, newMod: ModTypes) => {
        onModChange(location, locId, subId, newMod);
    }


    return (
        options &&
        <div className={"cage-mod-table"}>
            {Object.entries(cage.mods).map(([loc, mods]) => {
                const modLoc = parseInt(loc) as ModLocations;
                const sections = rack.type.sides[modLoc].sections;
                console.log("Load column: ", modLoc);
                console.log("Loading: ", cage);

                return (
                    <div key={`mod-${modLoc}`} className={"cage-mod-table-column"}>
                        <label className={"cage-mod-table-label"}>{ModLocations[modLoc]}</label>
                        {Array.from({length: sections}).map((_, idx) => {
                            const subsectionId = idx + 1;
                            const subsectionMods = mods.filter(mod => mod.subId === subsectionId);
                            const subsectionName = sections > 1
                            ? `${ModLocations[modLoc].split('',1)}-${subsectionId}`
                            : ModLocations[modLoc];

                            return(
                                <div key={`sub-mod-${modLoc}-${subsectionId}`}>
                                    {sections > 1 &&
                                        <label className={"cage-sub-mod-label"}>
                                            {subsectionName}
                                        </label>
                                    }
                                    {subsectionMods.map((subMods) => {
                                        return(subMods.mods.map((mod) => {
                                            return (
                                                <div key={`mod-${modLoc}-${mod.id}`} className={"cage-mod-table-cell"}>
                                                    <ModificationSelect
                                                        cage={cage}
                                                        removeMod={() => handleRemoveMod(modLoc, mod.id, subsectionId)}
                                                        changeMod={(newMod) => handleModChange(modLoc, mod.id, subsectionId, newMod)}
                                                        directionCategory={mod.mod === 'newMod' ? getLocationDirection(modLoc) : allCageMods[mod.mod].category}
                                                        defaultValue={{value: mod.mod, label: mod.mod === 'newMod' ? "New Mod" : allCageMods[mod.mod].title}}
                                                    />
                                                </div>
                                            );
                                        }))
                                    })}
                                    <span className={"cage-mod-table-add-mod"} onClick={() => handleAddNewMod(modLoc, subsectionId)}>&#43;</span>
                                </div>
                            )
                        })}

                    </div>
                )
            })}
        </div>
    );

};