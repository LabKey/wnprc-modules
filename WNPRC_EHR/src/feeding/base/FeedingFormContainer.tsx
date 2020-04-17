import * as React from 'react';
import {useEffect, useState, useContext} from 'react';
import FeedingForm from './FeedingForm';
import { Query, Security } from '@labkey/api';
import {AppContext} from "./ContextProvider";
import '../../theme/css/react-datepicker.css';
import '../../theme/css/index.css'

const FeedingFormContainer: React.FunctionComponent<any> = props => {

    const {setQueryDetailsExternal, queryDetails} = useContext(AppContext);
    const [formData, setFormData] = useState(
        {
            "animalid": {"value": ""},
            "date": {"value": new Date(),
            "type": {"value": ""}}
            }
        );

    const [columnData, setColumnData] = useState([]);
    const [columnDataTransformed, setColumnDataTransformed] = useState([]);

    //mutate the array
    const liftUpVal = (name, value) => {
        const newValues = Object.assign({}, formData);
        newValues[name]["value"] = value;
        setFormData(newValues);
    };

    useEffect( () => {
        Query.getQueryDetails({
            schemaName: 'study',
            queryName: 'feeding',
            success: (result) => {
                setColumnData(result.columns);
            }
        });
    },[]);

    useEffect(() => {
        let newDataArr = [];
        if (columnData.length > 0) {
                //what do i want to here, store in global state?
                newDataArr = columnData.reduce((acc, item) => {
                    if (!acc[item.name]) {
                        acc[item.name] = [];
                    }
                    acc[item.name] = item;
                    return acc;
                }, {});
            setQueryDetailsExternal(newDataArr);
            console.log(newDataArr["Id"]);
        }
    },[columnData]);

    //for each row / query column, create a text input?

    //or just create my text inputs in teh form and start by controlling simple things like the Label


    //the form could receive an array of queryColumns that then decide what to do with the fields...
    //but each field needs its own action what to do on blur / focus... validation etc
    //for starters i could reduce the array into like "animalid" > [type,hidden, etc]
    //and onBlur for each function, pass it to a parent functiont hat checks what it hsould do
    // const parentFunction() => {if e.currentTarget.name == 'animalid' then do this...}

    const onBlurAction = (name) => {

        if (name === 'animalid') {
            //load up animal stuff?
        }
    };

    return (
        <FeedingForm liftUpValue={liftUpVal} values={formData}/>
    );

};

export default FeedingFormContainer;
