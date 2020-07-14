import { useState } from "react";
import * as React from "react";
//import BulkEditFields from "../containers/Forms/BulkEditFields";
import SubmitModal from "./SubmitModal";

interface PropTypes {
    liftUpBulkValues: (values: object) => void;
    flipState: () => void;
    bulkEditFields: any;
}

/**
 * Uses a Submit Modal to display a set of fields used for bulk editing.
 * Requires an action to lift up all of the field values and flip the state
 *  flipstate just decides whether or not to show this modal.
 */
const BulkEditModal: React.FunctionComponent<PropTypes> = props => {
    const { liftUpBulkValues, flipState, bulkEditFields} = props;
    const [vals, setVals] = useState<any>();


    // The job of this component is to set the form fields
    // The job of the bulk edit fields is to pass the field values to this component

    const handleSubmit = () => {
        liftUpBulkValues(vals);
        flipState();
    };

    //Change this to context provider
    const liftUpBulkVals = (values: any) => {
        setVals(values);
    };

    const bodyText = (
        <div id="modal-body">
            {bulkEditFields}
        </div>
    );

    return (
        <SubmitModal
            name="bulk"
            title="Bulk Edit"
            submitAction={handleSubmit}
            flipState={flipState}
            bodyText={bodyText}
            submitText="Submit"
            enabled={true}
        />
    );
};
export default BulkEditModal;
