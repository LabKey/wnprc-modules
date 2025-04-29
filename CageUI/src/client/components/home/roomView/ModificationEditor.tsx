import * as React from 'react';
import { FC, ReactElement, useEffect, useRef } from 'react';
import '../../../cageui.scss';
import { SelectedObj } from '../../../types/layoutEditorTypes';
import { Cage } from '../../../types/typings';
import { CurrentCageLayout } from '../cageView/CurrentCageLayout';

interface Option {
    label: string;
    value: number;
}

interface ModificationEditorProps {
    showEditor: boolean;
    selectedObj: SelectedObj;
    closeMenu: () => void;
}

/*
    Context menu for room item. Renders differently depending on assigned type and passed in components.

 */
export const ModificationEditor: FC<ModificationEditorProps> = (props) => {
    const {
        showEditor,
        closeMenu,
        selectedObj,
    } = props;

    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            // Check if the click was outside the menu
            if (menuRef.current && !menuRef.current.contains(event.target)){
                closeMenu();
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
        showEditor &&
            <div className="modification-editor-popup-overlay" >
                <div className="modification-editor-popup" ref={menuRef}>
                    <div className="modification-editor-popup-header">
                        <h3 className="modification-editor-popup-title">{(selectedObj as Cage).cageNum}</h3>
                        <button className="modification-editor-popup-close" onClick={closeMenu}>&times;</button>
                    </div>
                    <div className="modification-editor-popup-content">
                        <CurrentCageLayout
                            cage={(selectedObj as Cage)}
                        />
                    </div>
                    <div className="modification-editor-popup-actions">
                        <button className="modification-editor-popup-button modification-editor-popup-cancel" onClick={closeMenu}>Cancel</button>
                        <button className="modification-editor-popup-button modification-editor-popup-save">Save</button>
                    </div>
                </div>
            </div>
    );
};