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
