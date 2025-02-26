import * as React from 'react';
import { FC } from 'react';
import '../../cageui.scss';
import { useHomeContext } from '../../context/HomeContextManager';

export const RackViewContent: FC = () => {
    const {selectedPage} = useHomeContext();

    return (
        <div>
            Rack {selectedPage.rack}
        </div>
    );
}