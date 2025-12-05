import * as React from 'react';
import { FC } from 'react';
import '../../../cageui.scss';
import { useHomeNavigationContext } from '../../../context/HomeNavigationContextManager';

export const CageViewContent: FC = () => {
    const {selectedPage} = useHomeNavigationContext();

    return (
        <div>
            Cage {selectedPage.cage}
        </div>
    );
}