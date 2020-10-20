import * as React from "react";
import { Table } from "react-bootstrap";
import {AnimalInfoProps} from '../typings/main';
//import Spinner from "./Spinner";

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
    return <div id="animal-info-empty">Loading...</div>;
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

  if (infoState == "loading-success") {
    return (
      <div>
        <Table responsive="sm" className="animal-info-table">
          <thead >
          <tr>
            <th colSpan={4}>
              {animalInfo.Id}
            </th>
          </tr>
          <tr></tr>
          </thead>
          <tbody>
          <tr>

          </tr>
            <tr>
              <td>Id</td>
              <td>
                <a href={animalInfo._labkeyurl_Id}>{animalInfo.Id}</a>
              </td>
              <td>Most Recent Alopecia Score</td>
              <td>
                <a href={animalInfo["_labkeyurl_mostRecentAlopeciaScore/score"]}>
                  {animalInfo["mostRecentAlopeciaScore/score"]}
                </a>
              </td>
            </tr>
            <tr>
              <td>Status</td>
              <td>
                <a href={animalInfo._labkeyurl_calculated_status}>
                  {animalInfo.calculated_status}
                </a>
              </td>
              <td>Most Recent BCS</td>
              <td>
                <a href={animalInfo["_labkeyurl_mostRecentBodyConditionScore/score"]}>
                  {animalInfo["mostRecentBodyConditionScore/score"]}
                </a>
              </td>
            </tr>
          <tr>
            <td>Room</td>
            <td>
              <a href={animalInfo["_labkeyurl_/curLocation/room"]}>{animalInfo["Id/curLocation/room"]}</a>
            </td>
            <td>Cage</td>
            <td>
              <a href={animalInfo["_labkeyurl_/curLocation/cage"]}>{animalInfo["Id/curLocation/cage"]}</a>
            </td>
          </tr>
          <tr>
            <td>Gender</td>
              <td>
                <a href={animalInfo._labkeyurl_genderd}>{animalInfo.gender}</a>
              </td>
              <td>Condition</td>
              <td>
                <a href={animalInfo["_labkeyurl_Id/curLocation/cond"]}>
                  {animalInfo["Id/curLocation/cond"]}
                </a>
              </td>
            </tr>
            <tr>
              <td>Dam</td>
              <td>
                <a href={animalInfo._labkeyurl_dam}>{animalInfo.dam}</a>
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
            <td>Sire</td>
            <td>
              <a href={animalInfo._labkeyurl_sire}>{animalInfo.sire}</a>
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
            <td>Avail</td>
            <td>
              {animalInfo.avail}
            </td>
            <td>Hold</td>
            <td>
              {animalInfo.hold}
            </td>
          </tr>
          <tr>
            <td>Age</td>
            <td>
              {animalInfo["Id/age/AgeFriendly"]}
            </td>
            <td>Birth</td>
            <td>
              <a href={animalInfo._labkeyurl_birth}>
                {animalInfo.birth}
              </a>
            </td>
          </tr>
          <tr>
            <td>Origin</td>
            <td>
              <a href={animalInfo._labkeyurl_origin}>
                {animalInfo.origin}
              </a>

            </td>
            <td># of Animals In Cage</td>
            <td>
              {animalInfo["Id/numRoommates/AnimalsInCage"]}
            </td>
          </tr>
          <tr>
            <td>Medical</td>
              <td></td>
              <td>Medical Obs</td>
              <td></td>
            </tr>
          <tr>
            <td>Current Behavior(s)</td>
            <td>
              {animalInfo["Id/CurrentBehavior/currentBehaviors"]}
            </td>
            <td>Death</td>
            <td>
              <a href={animalInfo._labkeyurl_death}>
                {animalInfo.death}
              </a>
            </td>
          </tr>
          <tr>
            <td>Most Recent Arrival</td>
            <td>
              <a href={animalInfo["_labkeyurl_Id/MostRecentArrival/MostRecentArrival"]}>{animalInfo["Id/MostRecentArrival/MostRecentArrival"]}</a>
            </td>
            <td>Most Recent Departure</td>
            <td>
              <a href={animalInfo["_labkeyurl_Id/MostRecentDeparture/MostRecentDeparture"]}>{animalInfo["Id/MostRecentDeparture/MostRecentDeparture"]}</a>
            </td>
          </tr>
          <tr>
            <td>Most Recent TB Date</td>
            <td>
              <a href={animalInfo["_labkeyurl_Id/MostRecentTB/MostRecentTBDate"]}>{animalInfo["Id/MostRecentTB/MostRecentTBDate"]}</a>
            </td>
            <td>Replacement prepaid by</td>
            <td>
              {animalInfo["prepaid"]}
            </td>
          </tr>
          </tbody>
        </Table>
      </div>
    );
  }
};

export default AnimalInfoPane;
