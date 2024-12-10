import * as React from 'react';
import {FC, useRef, useEffect} from 'react';
import '../cageui.scss';
import { parseRack } from './helpers'; // Add your menu CSS here

interface EditorContextMenuProps {
    ctxMenuStyle: {
        display: string;
        top: string;
        left: string;
    };
    onClickDelete: () => void;
    onClickRename: () => void;
    onClickChangeRack: () => void;
    closeMenu: () => void;
}

const EditorContextMenu: FC<EditorContextMenuProps> = (props) => {
    const {
        ctxMenuStyle,
        onClickDelete,
        onClickRename,
        onClickChangeRack,
        closeMenu
    } = props;
    const menuRef = useRef<HTMLMenuElement>(null);

    const handleRenameClick = (e: React.MouseEvent<HTMLElement>) => {
        e.stopPropagation();
        onClickRename();
    };

    const handleDeleteClick = (e: React.MouseEvent<HTMLElement>) => {
        e.stopPropagation();
        onClickDelete();
    };

    const handleChangeRack = (e: React.MouseEvent<HTMLElement>) => {
        e.stopPropagation();
        onClickChangeRack();
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            // Check if the click was outside the menu
            if (menuRef.current && !menuRef.current.contains(event.target)) {
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
        <menu
            ref={menuRef}
            id="ctxMenu"
            style={{
                display: ctxMenuStyle.display,
                position: 'absolute',
                left: ctxMenuStyle.left,
                top: ctxMenuStyle.top
            }}
        >
            <menu className={'menu-item'} title="Rename" onClick={handleRenameClick} />
            <menu className={'menu-item'} title="Delete" onClick={handleDeleteClick} />
            <menu className={'menu-item'} title="Change Rack" onClick={handleChangeRack} />
        </menu>
    );
};

export default EditorContextMenu;
