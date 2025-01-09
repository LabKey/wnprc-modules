import * as React from 'react';
import { FC, useRef, useEffect, Ref, useState } from 'react';
import '../cageui.scss';
import { parseRack, parseRoomItemNum } from './helpers';
import { CageNumInput } from './CageNumInput';
import { ChangeRackTypePopup } from './ChangeRackTypePopup';
import { Button } from 'react-bootstrap'; // Add your menu CSS here

interface EditorContextMenuProps {
    ctxMenuStyle: {
        display: string;
        top: string;
        left: string;
    };
    onClickDelete: () => void;
    closeMenu: () => void;
    onSubmitRename: (num: number) => void;
    onSubmitChangeRack: (newType: {value: number, label: string}) => void;
}

const EditorContextMenu: FC<EditorContextMenuProps> = (props) => {
    const {
        ctxMenuStyle,
        onClickDelete,
        closeMenu,
        onSubmitRename,
        onSubmitChangeRack
    } = props;

    const menuRef = useRef(null);

    const handleDeleteClick = (e: React.MouseEvent<HTMLElement>) => {
        e.stopPropagation();
        onClickDelete();
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
                <CageNumInput
                    onSubmit={(num) => {
                        onSubmitRename(num);
                        closeMenu()
                    }}
                />
            </div>
            <div className="menu-item">
                <label>Change Rack</label>
                <ChangeRackTypePopup
                    onSubmit={(newType) => {
                        onSubmitChangeRack(newType);
                        closeMenu()
                    }}
                />
            </div>
            <div className="menu-item">
                <Button
                    variant={'primary'}
                    onClick={handleDeleteClick}
                >
                    Delete Cage
                </Button>
            </div>
        </div>
    );
};

export default EditorContextMenu;
