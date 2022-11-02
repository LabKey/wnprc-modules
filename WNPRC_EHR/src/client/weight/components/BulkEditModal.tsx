import { useState } from "react";
import * as React from "react";
import BulkEditFields from "../containers/Forms/BulkEditFields";
import SubmitModal from "./SubmitModal";
import {BulkEditFormValues, BulkEditModalProps} from "../typings/main";

/**
 * Uses a Submit Modal to display a set of fields used for bulk editing.
 * Requires an action to lift up all of the field values and flip the state
 *  flipstate just decides whether or not to show this modal.
 */
const BulkEditModal: React.FunctionComponent<BulkEditModalProps> = props => {
  const { liftUpBulkValues, flipState, restraints} = props;
  const [vals, setVals] = useState<BulkEditFormValues>();

  const handleSubmit = (): void => {
    liftUpBulkValues(vals);
    flipState();
  };

  const liftUpBulkVals = (values: BulkEditFormValues): void => {
    setVals(values);
  };

  const bodyText = (
    <div id="modal-body">
      <BulkEditFields
        fieldValues={liftUpBulkVals}
        restraints={restraints}
      />
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
