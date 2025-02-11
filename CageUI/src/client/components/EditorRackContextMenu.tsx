import * as React from 'react';
import { FC, useRef, useEffect, Ref, useState } from 'react';
import '../cageui.scss';
import { parseRack, parseRoomItemNum } from './helpers';
import { TextInput } from './TextInput';
import { ChangeRack } from './ChangeRack';
import { Button } from 'react-bootstrap';
import { SelectedObj } from './typings'; // Add your menu CSS here

interface EditorRackContextMenuProps {
    ctxMenuStyle: {
        display: string;
        top: string;
        left: string;
    };
    onClickDelete: (type: string) => void;
    closeMenu: () => void;
    onSubmitRename: (num: number) => void;
    onSubmitChangeRack: (newType: {value: string, label: string}) => void;
}

const EditorRackContextMenu: FC<EditorRackContextMenuProps> = (props) => {
    const {
        ctxMenuStyle,
        onClickDelete,
        closeMenu,
        onSubmitRename,
        onSubmitChangeRack
    } = props;

    const menuRef = useRef(null);

    const handleDeleteCage = (e: React.MouseEvent<HTMLElement>) => {
        e.stopPropagation();
        onClickDelete("cage");
    };
    const handleDeleteRack = (e: React.MouseEvent<HTMLElement>) => {
        e.stopPropagation();
        onClickDelete("rack");
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            // Check if the click was outside the menu
            if (menuRef.current && !menuRef.current.contains(event.target)){
                console.log("closing menu inside menu");
                closeMenu(); // Close the menu if click is outside
            }
        };

        // Add event listener to detect clicks
        document.addEventListener('mousedown', handleClickOutside);

        // Cleanup event listener on component unmount
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [menuRef]);

    return (
        <div id="contextMenu" className="context-menu" ref={menuRef} style={{
            display: ctxMenuStyle.display,
            position: 'absolute',
            left: ctxMenuStyle.left,
            top: ctxMenuStyle.top,
            width: 200,
            height: 'auto'
        }}>
            <div className="menu-item">
                <label>New ID</label>
                <TextInput
                    onSubmit={(num) => {
                        onSubmitRename(num);
                        closeMenu()
                    }}
                />
            </div>
            <div className="menu-item">
                <label>Change Rack</label>
                <ChangeRack
                    onSubmit={(newType) => {
                        onSubmitChangeRack(newType);
                        closeMenu()
                    }}
                />
            </div>
            <div className="menu-item">
                <div className={"menu-item-group"}>
                    <Button
                        variant={'primary'}
                        onClick={handleDeleteCage}
                    >
                        Delete Cage
                    </Button>

                    <Button
                        variant={'primary'}
                        onClick={handleDeleteRack}
                    >
                        Delete Rack
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default EditorRackContextMenu;
