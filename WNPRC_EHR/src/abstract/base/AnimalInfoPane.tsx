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
    return <div id="animal-info-empty">Select a record with a valid animal id.</div>;
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
                  {animalInfo["mostRecentAlopeciaScore/score"]}
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
                {animalInfo["mostRecentBodyConditionScore/score"]}
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
            <td>
              Avail
            </td>
            <td>
              {animalInfo.avail}
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
              <td>Medical</td>
              <td></td>
              <td>Medical Obs</td>
              <td></td>
            </tr>
          </tbody>
        </Table>
      </div>
    );
  }
};

export default AnimalInfoPane;
