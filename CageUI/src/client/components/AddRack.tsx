import * as React from 'react';
import { FC } from 'react';

interface AddRackProps {

}
export const AddRack: FC<AddRackProps> = (props) => {
    return (
      <div className={"popup-overlay"}>
          <div className={"popup-content"}>
              Adding Rack
          </div>
      </div>
    );
}