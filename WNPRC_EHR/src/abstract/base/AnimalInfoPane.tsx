import * as React from "react";
import { Table } from "react-bootstrap";
import {AnimalInfoProps} from '../typings/main';
import EHRSpinner from "../../components/EHRSpinner";

interface PaneProps {
  animalInfo: AnimalInfoProps;
  infoState?: string;
}

/**
 * Displays animal info given a successful state.
 */
const AnimalInfoPane: React.FunctionComponent<PaneProps> = props => {
  const { animalInfo, infoState } = props;

  if (infoState == "waiting") {
    return <div id="animal-info-empty"><EHRSpinner text={'loading...'}></EHRSpinner></div>;
  }

  if (infoState == "loading-unsuccess") {
    return <div id="animal-info-empty">Animal not found.</div>;
  }

  if (infoState == "loading") {
    return (
      <div id="animal-info-empty">
        Loading...
      </div>
    );
  }

  //jsx doesn't respect new lines in a string
  const splitText = function(text:string) {
    if (text) {
      return text.split ('\n').map ((item, i) => <div key={i}>{item}</div>);
    }
  }

  if (infoState == "loading-success") {
    return (
      <div>
        <Table responsive="sm" className="animal-info-table">
          <thead >
          <tr>
            <th colSpan={4}>
              &nbsp;
            </th>
          </tr>
          </thead>
          <tbody>
          <tr>
            <td>Id</td>
            <td>
              <a href={animalInfo._labkeyurl_Id}>{animalInfo.Id}</a>
            </td>
            <td>Most Recent Alopecia Score</td>
            <td>
              {animalInfo["mostRecentAlopeciaScore/score"]}
            </td>
          </tr>
          <tr>
            <td>Room</td>
            <td>
              <a href={animalInfo["_labkeyurl_Id/curLocation/room"]}>{animalInfo["Id/curLocation/room"]}</a>
            </td>
            <td>Most Recent BCS</td>
            <td>
              {animalInfo["mostRecentBodyConditionScore/score"]}
            </td>
          </tr>
          <tr>
            <td>Cage</td>
            <td>
              <a href={animalInfo["_labkeyurl_Id/curLocation/cage"]}>{animalInfo["Id/curLocation/cage"]}</a>
            </td>
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
            <td>Gender</td>
            <td>
              <a href={animalInfo._labkeyurl_gender}>{animalInfo["gender/meaning"]}</a>
            </td>
            <td>Weight Date</td>
            <td>
              <a
                href={
                  animalInfo[
                    "_labkeyurl_Id/MostRecentWeight/MostRecentWeightDate"
                    ]
                }
              >
                {animalInfo["Id/MostRecentWeight/MostRecentWeightDate"]}
              </a>
            </td>
          </tr>
          <tr>
            <td>Status</td>
            <td>
              <a href={animalInfo._labkeyurl_calculated_status}>{animalInfo.calculated_status}</a>
            </td>
            <td>Hold</td>
            <td>
              {animalInfo.hold}
            </td>
          </tr>
          <tr>
            <td>Avail</td>
            <td>
              {animalInfo["Id/activeAssignments/Availability"][0]}
            </td>
            <td>Condition</td>
            <td>
              <a href={animalInfo["_labkeyurl_Id/curLocation/cond"]}>
                {animalInfo["Id/curLocation/cond"]}
              </a>
            </td>
          </tr>
          <tr>
            <td>Age</td>
            <td>
              {animalInfo["Id/age/AgeFriendly"]}
            </td>
            <td># of Animals In Cage</td>
            <td>
              {animalInfo["Id/numRoommates/AnimalsInCage"]}
            </td>
          </tr>
          <tr>
            <td>Birth</td>
            <td>
              <a href={animalInfo._labkeyurl_birth}>
                {animalInfo.birth}
              </a>
            </td>
            <td>Current Behavior(s)</td>
            <td>
              {animalInfo["Id/CurrentBehavior/currentBehaviors"]}
            </td>
          </tr>
          <tr>
            <td>Dam</td>
            <td>
              <a href={animalInfo._labkeyurl_dam}>{animalInfo.dam}</a>
            </td>
            <td>Death</td>
            <td>
              <a href={animalInfo._labkeyurl_death}>
                {animalInfo.death}
              </a>
            </td>
          </tr>
          <tr>
            <td>Sire</td>
            <td>
              <a href={animalInfo._labkeyurl_sire}>{animalInfo.sire}</a>
            </td>
            <td>Source/Vendor</td>
            <td>
              <a href={animalInfo["_labkeyurl_origin"]}>
                {animalInfo["origin/meaning"]}
              </a>
            </td>
          </tr>
          <tr>
            <td>Medical</td>
            <td>{animalInfo.medical}</td>
            <td>Most Recent Arrival</td>
            <td>
              <a href={animalInfo["_labkeyurl_Id/MostRecentArrival/MostRecentArrival"]}>{animalInfo["Id/MostRecentArrival/MostRecentArrival"]}</a>
            </td>
          </tr>
          <tr>
            <td>Most Recent TB Date</td>
            <td>
              <a href={animalInfo["_labkeyurl_Id/MostRecentTB/MostRecentTBDate"]}>{animalInfo["Id/MostRecentTB/MostRecentTBDate"]}</a>
            </td>
            <td>Most Recent Departure</td>
            <td>
              <a href={animalInfo["_labkeyurl_Id/MostRecentDeparture/MostRecentDeparture"]}>{animalInfo["Id/MostRecentDeparture/MostRecentDeparture"]}</a>
            </td>
          </tr>
          <tr>
            <td>Replacement prepaid by</td>
            <td>
              {animalInfo["prepaid"]}
            </td>
            <td>Pathology Notes</td>
            <td>
              {splitText(animalInfo["necropsyAbstractNotes/remark"])}
            </td>

          </tr>
          </tbody>
        </Table>
      </div>
    );
  }
};

export default AnimalInfoPane;
