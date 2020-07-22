import * as React from "react";
import { Table } from "react-bootstrap";
import Spinner from "./Spinner";

interface InfoProps {
  Id: string;
  calculated_status: string;
  gender: string;
  dam: string;
  birth: string;
  _labkeyurl_Id: string;
  _labkeyurl_calculated_status: string;
  _labkeyurl_genderd: string;
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
    return <div id="animal-info-empty">Select a record with a valid animal id.</div>;
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
                <a href={animalInfo._labkeyurl_Id}>{animalInfo.Id}</a>
              </td>
            </tr>
            <tr>
              <td>Status</td>
              <td>
                <a href={animalInfo._labkeyurl_calculated_status}>
                  {animalInfo.calculated_status}
                </a>
              </td>
            </tr>
            <tr>
              <td>Gender</td>
              <td>
                <a href={animalInfo._labkeyurl_genderd}>{animalInfo.gender}</a>
              </td>
            </tr>
            <tr>
              <td>Dam</td>
              <td>
                <a href={animalInfo._labkeyurl_dam}>{animalInfo.dam}</a>
              </td>
            </tr>
            <tr>
              <td>Active Assignments</td>
              <td></td>
            </tr>
            <tr>
              <td>Avail</td>
              <td></td>
            </tr>
            <tr>
              <td>Birth</td>
              <td>
                <a href={animalInfo._labkeyurl_birth}>{animalInfo.birth}</a>
              </td>
            </tr>
            <tr>
              <td>Age</td>
              <td></td>
            </tr>
            <tr>
              <td>Room</td>
              <td>
                <a href={animalInfo["_labkeyurl_Id/curLocation/room"]}>
                  {animalInfo["Id/curLocation/room"]}
                </a>
              </td>
            </tr>
            <tr>
              <td>Cage</td>
              <td>
                <a href={animalInfo["_labkeyurl_Id/curLocation/cage"]}>
                  {animalInfo["Id/curLocation/cage"]}
                </a>
              </td>
            </tr>
            <tr>
              <td>Condition</td>
              <td>
                <a href={animalInfo["_labkeyurl_Id/curLocation/cond"]}>
                  {animalInfo["Id/curLocation/cond"]}
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
                >
                  {animalInfo["Id/MostRecentWeight/MostRecentWeight"]}
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
              <td>Medical</td>
              <td></td>
            </tr>
            <tr>
              <td>Medical Obs</td>
              <td></td>
            </tr>
            <tr>
              <td>Current Behavior(s)</td>
              <td></td>
            </tr>
          </tbody>
        </Table>
      </div>
    );
  }
};

export default AnimalInfoPane;
