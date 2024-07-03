import * as React from 'react';
import {FC} from 'react';
import { useCurrentContext } from './ContextManager';


export const RoomToolbar: FC<any> = (props) => {
    const {isEditEnabled, setIsEditingRoom, setClickedRack} = useCurrentContext();
    const handleEdit = () => {
        setIsEditingRoom(prevState => !prevState);
        console.log("Editing Room");
    }
    return (
        <div className={"room-toolbar"}>
            <button
                className={"button-84"}
                onClick={handleEdit}
                disabled={!isEditEnabled}
            >
                Edit Room Layout
            </button>
        </div>
    );
}