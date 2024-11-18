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
    onClickRename: (e: React.MouseEvent<HTMLElement>) => void;
}

const EditorContextMenu: FC<EditorContextMenuProps> = (props) => {
    const {
        ctxMenuStyle,
        onClickDelete,
        onClickRename
    } = props;
    const menuRef = useRef<HTMLMenuElement>(null);

    const handleRenameClick = (e: React.MouseEvent<HTMLElement>) => {
        e.stopPropagation();
        onClickRename(e);
    };

    const handleDeleteClick = (e: React.MouseEvent<HTMLElement>) => {
        e.stopPropagation();
        onClickDelete();
    };

    return (
        <menu
            ref={menuRef}
            id="ctxMenu"
            style={{
                display: ctxMenuStyle.display,
                position: 'absolute',
                left: ctxMenuStyle.left,
                top: ctxMenuStyle.top,
                zIndex: 100,
            }}
        >
            <menu title="Rename" onClick={(e) => handleRenameClick(e)}>
            </menu>
            <menu title="Delete" onClick={handleDeleteClick}></menu>
        </menu>
    );
};

export default EditorContextMenu;
