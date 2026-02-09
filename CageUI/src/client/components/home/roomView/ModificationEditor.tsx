import * as React from 'react';
import { FC, useEffect, useState } from 'react';
import '../../../cageui.scss';
import { Cage, CurrCageMods, ModLocations, Rack } from '../../../types/typings';
import { CurrentCageLayout } from '../cageView/CurrentCageLayout';
import { CageModifications } from './CageModifications';

interface ModificationEditorProps {
    currCage: Cage;
    currRack: Rack;
    updateCageMods: (mods: CurrCageMods) => void;
}

/*
    Context menu for room item. Renders differently depending on assigned type and passed in components.

 */
export const ModificationEditor: FC<ModificationEditorProps> = (props) => {
    const {
        currCage,
        currRack,
        updateCageMods,
    } = props;

    const [currCageMods, setCurrCageMods] = useState<CurrCageMods>({
        adjCages: {
            [ModLocations.Left]: [],
            [ModLocations.Right]: [],
            [ModLocations.Top]: [],
            [ModLocations.Bottom]: [],
            [ModLocations.Direct]: []
        }, currCage: []
    });

    useEffect(() => {
        console.log('currCageMods: ', currCageMods);
    }, [currCageMods]);

    useEffect(() => {
        if(currCageMods){
            updateCageMods(currCageMods);
        }
    }, [currCageMods]);

    return (
        (currCage) &&
        <div className="modification-editor">
            <div className="modification-editor-content">
                <CurrentCageLayout
                    cage={currCage}
                />
                <CageModifications
                    cage={currCage}
                    rack={currRack}
                    currCageMods={currCageMods}
                    setCurrCageMods={setCurrCageMods}
                />
            </div>
        </div>
    );
};