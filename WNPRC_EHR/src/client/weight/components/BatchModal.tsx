import { useEffect, useState } from "react";
import * as React from "react";
import { labkeyActionSelectWithPromise } from "../query/actions";
import Select from "react-select";
import SubmitModal from "./SubmitModal";
import { ConfigProps, BatchModalProps } from "../typings/main";


// Custom styling for react-select dropdown
const customStyles = {
  option: (provided, state) => ({
    ...provided,
    width: 160
  }),
  control: provided => ({
    // none of react-select's styles are passed to <Control />
    ...provided,
    width: 160,
    borderRadius: "unset"
  }),
  menu: provided => ({
    ...provided,
    width: 160
  }),
  singleValue: (provided, state) => {
    const opacity = state.isDisabled ? 0.5 : 1;
    const transition = "opacity 300ms";

    return { ...provided, opacity, transition };
  }
};

/**
 * Uses Submit Modal to add batch records by a string of ids or room locaiton.
 */
const BatchModal: React.FunctionComponent<BatchModalProps> = props => {
  const [location, setLocation] = useState<Array<any>>([]);
  const [locations, setLocations] = useState<Array<any>>([]);
  const [ids, setIds] = useState([]);

  const handleSubmit = () => {
    props.setLocation(location);
    props.setIds(ids);
    props.flipState();
  };
  const handleChange = e => {
    setLocation(e);
  };

  //TODO some sort of memoization optimization here
  const handleIdChange = e => {
    if (e.target.value.indexOf(",") > 0) {
      setIds(e.target.value.split(","));
    }
    if (e.target.value.indexOf(";") > 0) {
      setIds(e.target.value.split(";"));
    }
    if (e.target.value.indexOf(" ") > 0) {
      setIds(e.target.value.split(" "));
    }
  };

  useEffect(() => {
    let config: ConfigProps = {
      schemaName: "ehr_lookups",
      queryName: "room_list"
    };

    labkeyActionSelectWithPromise(config).then(data => {
      let temp = [];
      data["rows"].forEach(item => {
        temp.push({ value: item.room, label: item.room });
      });
      setLocations(temp);
    });
  }, []);

  const bodyText = (
    <div id="modal-body">
      <div className="card-body">
        <div className="row">
          <div className="col-xs-3">
            <label htmlFor="ids">Id(s): </label>
          </div>
          <div className="col-xs-9">
            <textarea id="ids" name="ids" onChange={handleIdChange} />
          </div>
        </div>
        <div className="row">
          <div className="col-xs-3">
            <label htmlFor="locations">Room(s): </label>
          </div>
          <div className="col-xs-9">
            <Select
              id="locations"
              value={location}
              onChange={handleChange}
              options={locations}
              styles={customStyles}
              name="location-select"
              isMulti
              isSearchable
            />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <SubmitModal
      name="batch"
      title="Add Batch"
      submitAction={handleSubmit}
      flipState={props.flipState}
      bodyText={bodyText}
      submitText="Submit"
      enabled={true}
    />
  );
};
export default BatchModal;
