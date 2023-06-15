import * as React from "react";
import SubmitModal from "./SubmitModal";

interface PropTypes {
  errorText: any;
  setErrorText: any;
  flipState: any;
}

/**
 * Uses Submit Modal to show error dialogue.
 */
const ErrorModal: React.FunctionComponent<PropTypes> = (props) => {
  const {flipState, errorText, setErrorText} = props;
  const handleSubmit = () => {
    flipState();
    setErrorText("");
  };

  const handleCancel = () => {
    flipState();
    setErrorText("");
  };

  return (
    <SubmitModal
      name="error"
      title="Error"
      submitAction={handleSubmit}
      flipState={handleCancel}
      bodyText={errorText}
      submitText="OK"
      enabled={true}
    />
  );
};

export default ErrorModal;
