import * as React from 'react';
import {FC} from 'react';
import { useCurrentContext } from './ContextManager';


export const CageExtraDetails: FC<any> = (props) => {
    const {clickedCage} = useCurrentContext();

    return(
      <div className={"details-extra"}>
          <h2 className={"details-extra-header"}>Cage Details</h2>
     </div>
    );
}