import * as React from "react";
import { Table } from "react-bootstrap";
import Spinner from "./Spinner";

interface InfoProps {
  Id: string;
  calculated_status: string;
  gender: string;
  dam: string;
  birth: string;
  medical: string;
  _labkeyurl_Id: string;
  _labkeyurl_calculated_status: string;
  _labkeyurl_gender: string;
  _labkeyurl_dam: string;
  _labkeyurl_birth: string;
}

interface PaneProps {
  animalInfo: InfoProps;
  infoState?: string;
}

/**
 * Displays animal info given a successful state.
 */
const AnimalInfoPane: React.FunctionComponent<PaneProps> = props => {
  const { animalInfo, infoState } = props;

  if (infoState == "waiting") {
    return <div id="animal-info-empty">Select a record.</div>;
  }

  if (infoState == "loading-unsuccess") {
    return <div id="animal-info-empty">Animal not found.</div>;
  }

  if (infoState == "loading") {
    return (
      <div id="animal-info-empty">
        <Spinner text={"Loading..."} />
      </div>
    );
  }

  if (infoState == "loading-success") {
    return (
      <div>
        <Table responsive="sm" className="animal-info-table">
          <tbody>
          <tr>
            <td>Id</td>
            <td>
              <a href={animalInfo._labkeyurl_Id} target={"_blank"}>{animalInfo.Id}</a>
            </td>
          </tr>
          <tr>
            <td>Gender</td>
            <td>
              <a href={animalInfo._labkeyurl_gender} target={"_blank"}>{animalInfo.gender}</a>
            </td>
          </tr>
          <tr>
            <td>Room</td>
            <td>
              <a href={animalInfo["_labkeyurl_Id/curLocation/room"]} target={"_blank"}>
                {animalInfo["Id/curLocation/room"]}
              </a>
            </td>
          </tr>
          <tr>
            <td>Cage</td>
            <td>
              <a href={animalInfo["_labkeyurl_Id/curLocation/cage"]} target={"_blank"}>
                {animalInfo["Id/curLocation/cage"]}
              </a>
            </td>
          </tr>
          <tr>
            <td>Current Weight</td>
            <td>
              <a
                href={
                  animalInfo[
                    "_labkeyurl_Id/MostRecentWeight/MostRecentWeight"
                    ]
                }
                target={"_blank"}
              >
                {animalInfo["Id/MostRecentWeight/MostRecentWeight"]}
              </a>
            </td>
          </tr>
          <tr>
            <td>Weight Date</td>
            <td>
              <a
                href={
                  animalInfo[
                    "_labkeyurl_Id/MostRecentWeight/MostRecentWeightDate"
                    ]
                }
                target={"_blank"}
              >
                {animalInfo["Id/MostRecentWeight/MostRecentWeightDate"]}
              </a>
            </td>
          </tr>
          <tr>
            <td>Current Chow</td>
            <td>{animalInfo["Feeding/TypeOfChow"]}</td>
          </tr>
          <tr>
            <td>Chow Conversion</td>
            <td>{animalInfo["Feeding/chowConversion"]}</td>
          </tr>
          <tr>
            <td>Status</td>
            <td>
              <a href={animalInfo._labkeyurl_calculated_status} target={"_blank"}>
                {animalInfo.calculated_status}
              </a>
            </td>
          </tr>
          <tr>
            <td>Medical</td>
            <td>
              {animalInfo.medical}
            </td>
          </tr>
          <tr>
            <td>Dam</td>
            <td>
              <a href={animalInfo._labkeyurl_dam} target={"_blank"}>{animalInfo.dam}</a>
            </td>
          </tr>
          <tr>
            <td>Avail</td>
            <td>
              {animalInfo["Id/activeAssignments/Availability"]}
            </td>
          </tr>
          <tr>
            <td>Birth</td>
            <td>
              <a href={animalInfo._labkeyurl_birth} target={"_blank"}>{animalInfo.birth}</a>
            </td>
          </tr>
          <tr>
            <td>Age</td>
            <td>
              {animalInfo["Id/age/AgeFriendly"]}
            </td>
          </tr>
          <tr>
            <td>Condition</td>
            <td>
              <a href={animalInfo["_labkeyurl_Id/curLocation/cond"]} target={"_blank"}>
                {animalInfo["Id/curLocation/cond"]}
              </a>
            </td>
          </tr>
          <tr>
            <td>Current Behavior(s)</td>
            <td>
              <a
                href={
                  animalInfo[
                    "_labkeyurl_Id/CurrentBehavior/currentBehaviors"
                    ]
                }
                target={"_blank"}
              >
                {animalInfo["Id/CurrentBehavior/currentBehaviors"]}
              </a>
            </td>
          </tr>
          </tbody>
        </Table>
      </div>
    );
  }
};

export default AnimalInfoPane;
