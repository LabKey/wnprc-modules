/*
 * Copyright (c) 2021-2026 Board of Regents of the University of Wisconsin System
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { useEffect, useState } from "react";
import * as React from "react";
//import { labkeyActionSelectWithPromise } from "../query/actions";
import Select from "react-select";
import SubmitModal from "../components/SubmitModal";
import "../../../node_modules/bootstrap/dist/css/bootstrap.css";

interface PropTypes {
    setLocation: any;
    setIds: any;
    flipState: any;
}


export default {
    title: 'SubmitModal',
    component: SubmitModal,
};

export const ToStorybook = () => {
    const [location, setLocation] = useState("");
    const [locations, setLocations] = useState([]);
    const [ids, setIds] = useState([]);

    const handleSubmit = () => {
        console.log("Submitted");
    };
    const handleChange = e => {
        setLocation(e);
    };

    //TODO some sort of memoization optimization here
    const handleIdChange = e => {
        if (e.target.value.indexOf(",") > 0) {
            setIds(e.target.value.split(","));
        }
        if (e.target.value.indexOf(";") > 0) {
            setIds(e.target.value.split(";"));
        }
    };

    const bodyText = (
        <div id="modal-body">
            <div className="card-body">
                <div className="row">
                    <p>Body</p>
                </div>
            </div>
        </div>
    );

    return (
        <SubmitModal
            name="submit-modal"
            title="Submit Modal Title"
            submitAction={handleSubmit}
            flipState={()=>{console.log("Flipped, should show/hide this.")}}
            bodyText={bodyText}
            submitText="Submit"
            enabled={true}
        />
    );
};
