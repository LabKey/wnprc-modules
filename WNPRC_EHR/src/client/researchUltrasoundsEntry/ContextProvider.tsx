import * as React from "react";
import { createContext, useEffect, useState } from "react";
import {
    checkEditMode,
    labkeyActionSelectWithPromise,
} from "../query/helpers";
import { ActionURL, Filter } from "@labkey/api";
import {
    ConfigProps,
    ContextProps,
    InfoProps,
    infoStates
} from "./typings";

import {StatusStates} from '../typings/taskPaneTypes';
import { RowObj } from '../feeding/typings/main';


const AppContext = createContext({} as ContextProps);

/*
This provides the context for the page and the states that the components use. Each component should be reusable so you
only have to define your states here and then import the components and their states into your main container file.
In this example that is the ResearchUltrasoundFormContainer. The context is provided in the app/dev file and is available
to all components that are inside the main container.
 */
const ContextProvider: React.FunctionComponent = ({ children }) => {
    //introduce type of field here?
    const [animalInfo, setAnimalInfo] = useState<InfoProps>(null);
    const [animalInfoState, setAnimalInfoState] = useState<infoStates>("waiting");
    const [animalInfoCache, setAnimalInfoCache] = useState<any>();

    const [taskStatus, setTaskStatus] = useState<StatusStates>("In Progress");
    const [taskTitle, setTaskTitle] = useState( "Research Ultrasounds");

    const [validId, setValidId] = useState<boolean>(false);

    const [state, setState] = useState({
        id: '',
        date: new Date(),
        idPregnancies: [],
        idProject: [],
        account: '',
        fetalHB: false,
        remark: '',
    });

    const [formData, setFormData] = useState({
            id: { value: "", error: "" },
            date: { value: new Date(), error: "" },
            type: { value: "", error: "" },
            amount: { value: "", error: "" },
            remark: { value: "", error: "" },
            lsid: { value: "", error: "" },
            command: { value: "insert", error: "" },
            QCStateLabel: { value: "Completed", error: "" },
        }
    );

    const defaultContext = {
        setAnimalInfo,
        animalInfo,
        setAnimalInfoState,
        animalInfoState,
        taskStatus,
        setTaskStatus,
        taskTitle,
        setTaskTitle,
        validId,
        setValidId,
        formData,
        animalInfoCache,
        setAnimalInfoCache
    };
    return (
        <AppContext.Provider value={defaultContext}>{children}</AppContext.Provider>
    );
};

export { AppContext, ContextProvider };
