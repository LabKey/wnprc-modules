import * as React from 'react';
import { FC, useEffect } from 'react';
import '../../cageui.scss';
import { useHomeContext } from '../../context/HomeContextManager';

export const RackViewContent: FC = () => {
    const {selectedPage, localRoom} = useHomeContext();

    useEffect(() => {
        console.log(selectedPage.rack);
        console.log(localRoom);
    }, []);

    return (
        <div>
            Rack {selectedPage.rack}
        </div>
    );
}