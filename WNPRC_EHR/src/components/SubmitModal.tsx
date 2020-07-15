import { Button, Modal } from "react-bootstrap";
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
