import * as React from 'react';
import { FC, useEffect } from 'react';
import { AnimalInCage } from '../../../types/homeTypes';
import { Cage } from '../../../types/typings';
import { useRoomContext } from '../../../context/RoomContextManager';
import { findAnimalsInCage } from '../../../api/popularQueries';

interface AnimalEditorProps {
    currCage: Cage;
}

export const AnimalEditor: FC<AnimalEditorProps> = (props) => {
    const { currCage } = props;
    const {selectedRoom} = useRoomContext();
    const [animalsInCage, setAnimalsInCage] = React.useState<AnimalInCage[]>([]);

    useEffect(() => {
        findAnimalsInCage(selectedRoom.name, currCage.cageNum).then(res => {
            setAnimalsInCage(res);
        });
    }, []);

    const startHousingTransfer = (animal: AnimalInCage) => {

    }

    return (
      <div className={'animal-editor'}>
          <h2 className={"animal-editor-title"}>Animals</h2>
          {animalsInCage.length > 0 &&
              <div className={'animal-editor-list'}>
                  <ul>
                      {animalsInCage.map((animal, idx) => (
                          <li key={`animal-list-${idx}`}>
                              <div>{animal.id}</div>
                              <button onClick={() => startHousingTransfer(animal)}>
                                  Transfer
                              </button>
                          </li>
                      ))}
                  </ul>
              </div>
          }
      </div>
    );
}