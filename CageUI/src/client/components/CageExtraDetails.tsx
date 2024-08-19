import * as React from 'react';
import {FC} from 'react';
import { useRoomContext } from './ContextManager';


export const CageExtraDetails: FC<any> = (props) => {
    const {clickedCage} = useRoomContext();

    return(
      <div>
          <h2>Cage Details</h2>
     </div>
    );
}