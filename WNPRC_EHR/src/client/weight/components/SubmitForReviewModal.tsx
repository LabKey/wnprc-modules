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
import * as React from "react";
import SubmitModal from "../../components/SubmitModal";
import { useContext, useEffect, useState } from "react";
import { labkeyActionSelectWithPromise } from "../query/actions";
import { AppContext } from "../containers/App/ContextProvider";
import DropdownOptions from "./DropdownOptions";
import { ConfigProps, SubmitForReviewModalProps} from "../typings/main";

/**
 * Similar to SubmitModal but requires options and sets a reviewer by lifting state up.
 */
const SubmitForReviewModal: React.FunctionComponent<SubmitForReviewModalProps> = props => {
  const { action, setreviewer, flipState } = props;

  //TODO move this state up?
  const [reviewers, setReviewers] = useState<Array<any>>(null);
  const [reviewer, setReviewer] = useState<number>(null);
  const [enabled, setEnabled] = useState<boolean>(false);
  const { submitted } = useContext(AppContext);

  const handleChange = (e: number) => {
    if (!e) {
      return;
    }
    setReviewer(e);
    setEnabled(true);
  };

  useEffect(() => {
    //should this be done on page load?
    let config: ConfigProps = {
      schemaName: "core",
      queryName: "PrincipalsWithoutAdmin",
      columns: "UserId,DisplayName",
      sort: "Type,DisplayName"
    };
    labkeyActionSelectWithPromise(config).then(data => {
      let temp = [];
      data["rows"].forEach(item => {
        temp.push({ value: item.UserId, label: item.DisplayName });
      });
      setReviewers(temp);
    });
  }, []);

  useEffect(() => {
    setreviewer(reviewer);
  }, [reviewer]);

  const theoptions = (
      <div className="row">
        <div className="col-xs-3">
          <label htmlFor="reviewers">Assign To: </label>
        </div>
        <div className="col-xs-8">
          <DropdownOptions
            initialvalue=""
            value={handleChange}
            options={reviewers}
            name="reviewers"
            id="reviewers"
            classname="form-control"
            valuekey="value"
            displaykey="label"
          />
        </div>
      </div>
  );

  return (
    <SubmitModal
      name="final"
      title="Submit for Review"
      submitAction={() => {
        action();
      }}
      flipState={flipState}
      bodyText={!submitted ? theoptions : "Success!"}
      submitText="Submit final"
      enabled={enabled}
    />
  );
};

export default SubmitForReviewModal;
