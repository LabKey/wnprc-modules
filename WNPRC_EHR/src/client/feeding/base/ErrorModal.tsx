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
import { useContext } from "react";
import SubmitModal from "../../components/SubmitModal";
import { AppContext } from "./ContextProvider";

interface PropTypes {
  errorText: any;
  flipState: any;
}

/**
 * Uses Submit Modal to show error dialogue.
 */
const ErrorModal: React.FunctionComponent<PropTypes> = (props) => {
  const { setErrorTextExternal } = useContext(AppContext);

  const handleSubmit = () => {
    props.flipState();
    setErrorTextExternal("");
  };

  const handleCancel = () => {
    props.flipState();
    setErrorTextExternal("");
  };

  const bodyText = props.errorText;

  return (
    <SubmitModal
      name="error"
      title="Error"
      submitAction={handleSubmit}
      flipState={handleCancel}
      bodyText={bodyText}
      submitText="OK"
      enabled={true}
    />
  );
};

export default ErrorModal;
