import * as React from 'react';
import {FC} from 'react';
import { useCurrentContext } from './ContextManager';


export const CageExtraDetails: FC<any> = (props) => {
    const {clickedCage} = useCurrentContext();

    return(
      <div className={"details-extra"}>

      </div>
    );
}