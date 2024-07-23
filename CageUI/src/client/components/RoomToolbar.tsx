import * as React from 'react';
import {FC} from 'react';
import { useCurrentContext } from './ContextManager';


export const RoomToolbar: FC<any> = (props) => {
    const {isEditEnabled, setIsEditingRoom, setClickedRack, setIsDraggingEnabled, isEditingRoom, isDraggingEnabled} = useCurrentContext();
    const handleEdit = () => {
        setIsEditingRoom(prevState => !prevState);
        console.log("Editing Room");
    }
    const handleDrag = () => {
        setIsDraggingEnabled(prevState => !prevState);
        console.log("Dragging Room");
    }
    return (
        <div className={"room-toolbar"}>
            <div className={"room-toolbar-buttons"}>
                <div className="checkbox-wrapper-10">
                    <input
                        className="tgl tgl-flip"
                        id="cb1"
                        type="checkbox"
                        checked={isEditingRoom}
                        disabled={!isEditEnabled}
                        onChange={handleEdit}
                    />
                    <label
                        className="tgl-btn"
                        data-tg-off="Editing Racks Disabled"
                        data-tg-on="Editing Racks Enabled"
                        htmlFor="cb1"></label>
                </div>
                <div className="checkbox-wrapper-10">
                    <input
                        className="tgl tgl-flip"
                        id="cb2"
                        type="checkbox"
                        checked={isDraggingEnabled}
                        disabled={!isEditEnabled}
                        onChange={handleDrag}
                    />
                    <label
                        className="tgl-btn"
                        data-tg-off="Drag Behavior Disabled"
                        data-tg-on="Drag Behavior Enabled"
                        htmlFor="cb2"></label>
                </div>
            </div>
        </div>
    );
}