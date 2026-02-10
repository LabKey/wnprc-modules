import * as React from 'react';
import { FC } from 'react';

interface AnimalEditorProps {

}

export const AnimalEditor: FC<AnimalEditorProps> = (props) => {

    return (
      <div className={'animal-editor'}>
          <h2 className={"animal-editor-title"}>Animals</h2>
      </div>
    );
}