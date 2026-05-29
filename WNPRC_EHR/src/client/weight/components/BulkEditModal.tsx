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
import { useState } from "react";
import * as React from "react";
import BulkEditFields from "../containers/Forms/BulkEditFields";
import SubmitModal from "../../components/SubmitModal";
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
