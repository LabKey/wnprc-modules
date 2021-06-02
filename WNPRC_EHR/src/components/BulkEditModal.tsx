import { useContext } from "react";
import * as React from "react";
import SubmitModal from "./SubmitModal";
import { AppContext } from "../feeding/base/ContextProvider";

interface PropTypes {
  flipState: () => void;
  bulkEditFields: any;
  updateFormDataFunction: any;
}

/**
 * Uses a Submit Modal to display a set of fields used for bulk editing.
 * Requires an action to lift up all of the field values and flip the state
 *  flipstate just decides whether or not to show this modal.
 *  Also requires an action from the context provider to set the form data
 */
const BulkEditModal: React.FunctionComponent<PropTypes> = (props) => {
  const { flipState, bulkEditFields, updateFormDataFunction } = props;

  const handleSubmit = () => {
    //Update form values in the context provider
    updateFormDataFunction();
    flipState();
  };

  const bodyText = <div id="modal-body">{bulkEditFields}</div>;

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
