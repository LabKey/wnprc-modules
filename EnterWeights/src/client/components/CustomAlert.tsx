import * as React from "react";
import { Alert } from "react-bootstrap";

interface AlertPropTypes {
  body: any;
  show: boolean;
  variant: any;
  onClose: any;
  dismissable: boolean;
}

/**
 * Shows a bootstrap alert given a few props.
 */
const CustomAlert: React.FunctionComponent<AlertPropTypes> = props => {
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
