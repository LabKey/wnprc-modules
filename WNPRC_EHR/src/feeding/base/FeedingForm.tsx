import * as React from 'react';
import TextInput from '../../components/TextInput';
import InputLabel from '../../components/InputLabel';

const FeedingForm: React.FunctionComponent<any> = props => {

    const liftUpValue = (e) => {
        props.liftUpValue(e.currentTarget.value);
    };

    return (
        <div className="row">
            <div className="col-xs-2">
                <InputLabel labelFor="animalid" label="Id"/>
            </div>
            <div className="col-xs-8">
                <TextInput
                    name="animalid"
                    id="animalid-id"
                    className="animalid"
                    value={props.value}
                    onChange={liftUpValue}
                    onBlur={()=>{console.log('blur')}}
                    onFocus={()=>{console.log('focus')}}
                    required={true}
                    autoFocus={true}
                />
            </div>
        </div>
    )
    
};

export default FeedingForm;
