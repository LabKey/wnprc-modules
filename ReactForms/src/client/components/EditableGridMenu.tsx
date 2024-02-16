import * as React from 'react';
import {FC} from 'react';
import "../theme/css/index.css";

interface EditableGridMenuProps {
    onAddRow: () => void;
}

export const EditableGridMenu: FC<EditableGridMenuProps> = (props) => {
    const { onAddRow } = props;

    return(
        <div className="grid-menu">
            <button onClick={onAddRow}>Add Row</button>
            {/* You can add more buttons for other actions if needed */}
        </div>
    );
};

