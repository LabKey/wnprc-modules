import * as React from "react";

/**
 * Shows labkey loading spinner next to some text.
 */
const Spinner: React.FunctionComponent<any> = props => {
    const { text } = props;
    return (
        <div>
            <img
                src={`/_images/ajax-loading.gif`}
            />{" "}
            {text}
        </div>
    );
};

export default Spinner;