import { useState } from "react";
import * as React from "react";
import BulkEditFields from "../containers/Forms/BulkEditFields";
import SubmitModal from "./SubmitModal";

interface PropTypes {
  liftUpBulkValues: (values: object) => void;
  flipState: () => void;
  restraints: any;
}

interface BulkEditValues {
  weight: object;
  date: object;
  remark: object;
  restraint: object;
}

/**
 * Uses a Submit Modal to display a set of fields used for bulk editing.
 * Requires an action to lift up all of the field values and flip the state
 *  flipstate just decides whether or not to show this modal.
 */
const BulkEditModal: React.FunctionComponent<PropTypes> = props => {
  const { liftUpBulkValues, flipState, restraints} = props;
  const [vals, setVals] = useState<BulkEditValues>();

  const handleSubmit = () => {
    liftUpBulkValues(vals);
    flipState();
  };

  const liftUpBulkVals = (values: BulkEditValues) => {
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
