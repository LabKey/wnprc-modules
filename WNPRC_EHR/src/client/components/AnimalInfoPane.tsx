import * as React from "react";
import { Table } from "react-bootstrap";
import Spinner from "./Spinner";
import { FieldPathValue, FieldValues, useFormContext } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { getAnimalInfo } from '../query/helpers';
import { infoStates } from '../researchUltrasoundsEntry/typings';

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
  setAnimalInfoCache?: any;
}

/**
 * Displays animal info given a successful state.
 */
const AnimalInfoPane: React.FunctionComponent<PaneProps> = (props) => {
  const { setAnimalInfoCache } = props;

  const [animalInfo, setAnimalInfo] = useState<InfoProps>(null);
  const [animalInfoState, setAnimalInfoState] = useState<infoStates>("waiting");

  // Watch the animal Id which should be stored as "global.Id" automatically
  const {watch} = useFormContext();
  const animalId = watch("global.Id" as FieldPathValue<FieldValues, any>);

  useEffect(() => {
    if(animalId === undefined){
      return;
    }
    getAnimalInfo(animalId, setAnimalInfo, setAnimalInfoState, setAnimalInfoCache);
  },[animalId]);

  if (animalInfoState == "waiting") {
    return (
        <div className="col-xs-5 panel panel-portal animal-info-pane">
          <div className="panel-heading">
            <h3>Animal Info</h3>
          </div>
          <div id="animal-info-empty">Select a record.</div>
        </div>);
  }

  if (animalInfoState == "loading-unsuccess") {
    return (
        <div className="col-xs-5 panel panel-portal animal-info-pane">
          <div className="panel-heading">
            <h3>Animal Info</h3>
          </div>
          <div id="animal-info-empty">Animal not found.</div>
        </div>);
  }

  if (animalInfoState == "loading") {
    return (
        <div className="col-xs-5 panel panel-portal animal-info-pane">
          <div className="panel-heading">
            <h3>Animal Info</h3>
          </div>
          <div id="animal-info-empty">
            <Spinner text={"Loading..."} />
          </div>
        </div>
    );
  }

  if (animalInfoState == "loading-success") {
    return (
        <div className="col-xs-5 panel panel-portal animal-info-pane">
          <div className="panel-heading">
            <h3>Animal Info</h3>
          </div>
          <div>
            <Table responsive className="animal-info-table">
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
        </div>
    );
  }
};

export default AnimalInfoPane;
