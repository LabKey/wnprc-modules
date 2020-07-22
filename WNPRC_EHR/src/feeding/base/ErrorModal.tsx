import * as React from "react";
import SubmitModal from "../../components/SubmitModal"

interface PropTypes {
  errorText: any;
  flipState: any;
}

/**
 * Uses Submit Modal to show error dialogue.
 */
const ErrorModal: React.FunctionComponent<PropTypes> = props => {

  const handleSubmit = () => {
    props.flipState();
  };

  const bodyText = props.errorText;

  return (
    <SubmitModal
      name="error"
      title="Error"
      submitAction={handleSubmit}
      flipState={props.flipState}
      bodyText={bodyText}
      submitText="OK"
      enabled={true}
    />
  );
};

export default ErrorModal;
