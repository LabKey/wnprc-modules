import * as React from 'react';
import {useState} from 'react';
import FeedingForm from './FeedingForm';

const FeedingFormContainer: React.FunctionComponent<any> = props => {

    const [val, setVal] = useState("");

    const liftUp = (val:string) => {
        setVal(val);
    };

    //the form could receive an array of queryColumns that then decide what to do with the fields...
    //but each field needs its own action what to do on blur / focus... validation etc
    //for starters i could reduce the array into like "animalid" > [type,hidden, etc]
    //and onBlur for each function, pass it to a parent functiont hat checks what it hsould do
    // const parentFunction() => {if e.currentTarget.name == 'animalid' then do this...}

    return (
        <FeedingForm liftUpValue={liftUp} value={val} />
    );

};

export default FeedingFormContainer;
