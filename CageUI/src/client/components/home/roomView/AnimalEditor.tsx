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
import { FC, useEffect, useState } from 'react';
import { AnimalInCage } from '../../../types/homeTypes';
import { Cage } from '../../../types/typings';
import { findAnimalsInCage } from '../../../api/popularQueries';
import { useHomeNavigationContext } from '../../../context/HomeNavigationContextManager';
import { ActionURL } from '@labkey/api';

interface AnimalEditorProps {
    currCage: Cage;
}

export const AnimalEditor: FC<AnimalEditorProps> = (props) => {
    const { currCage } = props;
    const {selectedRoom} = useHomeNavigationContext();
    const [animalsInCage, setAnimalsInCage] = useState<AnimalInCage[]>([]);
    const [selectedAnimals, setSelectedAnimals] = useState<AnimalInCage[]>([]);

    useEffect(() => {
        findAnimalsInCage(selectedRoom.name, currCage.cageNum).then(res => {
            setAnimalsInCage(res);
        });
    }, []);

    const addToSelectedAnimals = (animal: AnimalInCage) => {
        const isAnimalCurrentlySelected = selectedAnimals.find(a => a.id === animal.id);
        if(isAnimalCurrentlySelected){
            setSelectedAnimals(prevState => prevState.filter(a => a.id !== animal.id));
        }else{
            setSelectedAnimals(prevState => [...prevState, animal]);
        }
    }

    const startHousingTransfer = () => {
        window.location.href = ActionURL.buildURL(ActionURL.getController(), 'housingTransfer', ActionURL.getContainer(), {
            subjects:  selectedAnimals.map(animal => animal.id).join(','),
            returnUrl: window.location.href
        });
    }

    return (
        <div className={'animal-editor'}>
            <h2 className={"animal-editor-title"}>Animals</h2>
            {animalsInCage.length > 0 &&
                <div className={'animal-editor-list'}>
                    <ul>
                        {animalsInCage.map((animal, idx) => (
                            <li
                                key={`animal-list-${idx}`}
                                className={selectedAnimals.find(a => a.id === animal.id) ? 'selected' : ''}
                                onClick={() => addToSelectedAnimals(animal)}
                            >
                                <div>{animal.id}</div>
                            </li>
                        ))}
                    </ul>
                </div>
            }
            {selectedAnimals.length > 0 &&
                <button onClick={startHousingTransfer}>Start Animal Transfer</button>
            }
        </div>
    );
}