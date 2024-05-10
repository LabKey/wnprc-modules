import * as React from 'react';
import { useState, FC, useRef, useEffect } from 'react';
import { Cage } from './typings';

interface CageDetailsProps {
    isOpen: boolean;
    onClose: () => any;
    cage: Cage;
}
export const CageDetails: FC<CageDetailsProps> = (props) => {
    const { isOpen, onClose, cage } = props;
    const modalRef = useRef(null);

    if(!cage) return;

    const addMod = () => {
        console.log("mod");

    }

    // close modal if user clicks outside its bounds
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    return (
        <div className="details-overlay">
            <div className="details-content" ref={modalRef}>
                <div className={'details-header'}>
                    <h1>Cage #{cage.name}</h1>
                    <button className="details-close-button" onClick={onClose}>
                        &times;
                    </button>
                </div>
                <div className={"details-subheader"}>
                    <h4>Total: 2</h4>
                    <h4>Status: OK</h4>
                </div>
                <div className={"details-divider"} />
                <div className={"details-modifications"}>
                    <div className={"details-mod-header"}>
                        <h2>Modifications</h2>
                        <button className="details-add-mod" onClick={addMod}>
                            Add &#43;
                        </button>
                    </div>
                    <table className={"details-table"}>
                        <thead>
                            <tr>
                                <th>Mod</th>
                                <th>Affected Cages</th>
                            </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <td>{cage.cageState.divider.name}</td>
                            <td>#0003</td>
                        </tr>
                        <tr>
                            <td>{cage.cageState.floor.name}</td>
                            <td>#0004</td>
                        </tr>
                        {cage.cageState.extraMods.map((mod, idx) => {
                            if (mod.name === "") return;
                            return (
                                <tr key={idx}>
                                    <td>{mod.name}</td>
                                    <td>#testCageNum</td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                    <ul>
                        <li>
                            {cage.cageState.divider.name}
                        </li>
                        <li>
                            {cage.cageState.floor.name}
                        </li>
                        {cage.cageState.extraMods.map((mod, idx) => {
                            if (mod.name === "") return;
                            return (
                                <li key={idx}>
                                    {mod.name}
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>
        </div>
    );
};
