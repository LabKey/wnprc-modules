import * as React from 'react';
import { FC } from 'react';
import '../../cageui.scss';
import { useHomeContext } from '../../context/HomeContextManager';

export const CageViewContent: FC = () => {
    const {selectedPage} = useHomeContext();

    return (
        <div>
            Cage {selectedPage.cage}
        </div>
    );
}