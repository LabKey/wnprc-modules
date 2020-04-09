import * as React from 'react';
import {useState} from 'react';
import FeedingForm from './FeedingForm';

const FeedingFormContainer: React.FunctionComponent<any> = props => {

    const [val, setVal] = useState("");

    const liftUp = (val:string) => {
        setVal(val);
    };

    return (
        <FeedingForm liftUpValue={liftUp} value={val} />
    );

};

export default FeedingFormContainer;
