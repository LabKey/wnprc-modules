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
import {Button} from 'react-bootstrap';
import {Modal} from 'react-bootstrap';
import { useState } from "react";
import * as React from "react";
import Spinner from "./Spinner";

interface PropTypes {
  name: string;
  title: string;
  bodyText: any;
  submitText: string;
  enabled: boolean;
  submitAction: () => void;
  flipState: () => void;
}

/**
 * Shows a modal dialogue. Requires PropTypes above, including two functions,
 * one, flipState that flips state between show and hide controlled by parent and another,
 * submitAction that is a function which fires an action after submit.
 */
const SubmitModal: React.FunctionComponent<PropTypes> = (props) => {
  const [enableButton, setEnableButton] = useState(false);
  const {
    name,
    title,
    bodyText,
    submitAction,
    flipState,
    submitText,
    enabled,
  } = props;

  const handleSubmit = () => {
    setEnableButton(true);
    submitAction();
  };
  const handleCancel = () => {
    flipState();
  };

  return (
    <React.Fragment>
      <Modal show={true} animation={false} centered onHide={handleCancel}>
        <Modal.Header closeButton>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="centered-wrapper">
            {enableButton ? <Spinner text={bodyText} /> : bodyText}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            variant="primary"
            id={`submit-${name}`}
            onClick={handleSubmit}
            disabled={!enabled}
          >
            {submitText}
          </Button>
        </Modal.Footer>
      </Modal>
    </React.Fragment>
  );
};
export default SubmitModal;
