import * as React from "react";
import { ActionURL } from "@labkey/api";

/**
 * Shows labkey loading spinner next to some text.
 */
const Spinner: React.FunctionComponent<any> = (props) => {
  const { text } = props;
  return (
    <div>
      <img src={ActionURL.getContextPath() + `/_images/ajax-loading.gif`} />{" "}
      {text}
    </div>
  );
};

export default Spinner;
