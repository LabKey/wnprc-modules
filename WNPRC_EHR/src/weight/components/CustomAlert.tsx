import * as React from "react";
import { Alert } from "react-bootstrap";
import { CustomAlertProps } from "../typings/main";

/**
 * Shows a bootstrap alert given a few props.
 */
const CustomAlert: React.FunctionComponent<CustomAlertProps> = props => {
  const { body, show, variant, onClose, dismissable } = props;

  return (
    <Alert
      show={show}
      variant={variant}
      className="in"
      dismissible={dismissable}
      onClose={onClose}
    >
      {body}
    </Alert>
  );
};

export default CustomAlert;
