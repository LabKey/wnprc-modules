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
