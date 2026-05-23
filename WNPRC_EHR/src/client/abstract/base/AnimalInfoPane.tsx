/*
 * Copyright (c) 2020-2026 Board of Regents of the University of Wisconsin System
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import * as React from "react";
import { Table } from "react-bootstrap";
import {AnimalInfoProps} from '../typings/main';
import EHRSpinner from "../../components/EHRSpinner";

interface PaneProps {
  animalInfo: AnimalInfoProps;
  infoState?: string;
}

//jsx doesn't respect new lines in a string
const splitText = function(text:string) {
  if (text) {
    return text.split ('\n').map ((item, i) => <div key={i}>{item}</div>);
  }
}

// this will return the name of the field,
// sometimes it has to "drilldown" for a field like "Id/curLocation/room"
const getNameOfField = (field:object) => {
  let arr = [];
  let item = field["fieldKey"]
  let fieldName = item.name;
  while (item.parent){
    arr.unshift(item.parent.name);
    item = item.parent;
  }
  arr.push(fieldName);
  let finalName = arr.join("/");
  return finalName;
}

// create an array with two values per index
// uses the 'metadata' property from LabKey selectRows() to build the data struct
let constructArrayForTable = (animalInfo) => {
  let tableArr = [];
  let filteredArr = [];

  // filter the array to only include columns that aren't hidden
  for (let i = 0; i < animalInfo["metaData"]["fields"].length; i++) {
    if (!animalInfo["metaData"]["fields"][i].hidden) {
      let fieldMetadata = animalInfo["metaData"]["fields"][i];
      let key = getNameOfField(fieldMetadata);
      let isDate: boolean = fieldMetadata.type === "date";

      let column = animalInfo["rows"][0][key];
      //cover the case where column could be an array
      if (Array.isArray(column) && column.length > 0) {
        column = column[0];
      }

      let item = {
        label: fieldMetadata["caption"],
        displayValue: isDate ? column["formattedValue"] : column["displayValue"],
        url: column["url"],
        value: column["value"]
      };
      filteredArr.push(item);
    }
  }

  // if there are an odd number of items in the array then add
  // a blank one so that the last (bottom right) cell in the
  // abstract table is rendered as an empty cell
  if (filteredArr.length % 2 != 0) {
    filteredArr.push({
      label: "",
      displayValue: "",
      url: "",
      value: ""
    });
  }

  // each row in the abstract table will have 4 columns,
  // <tr>(<td>label</td> <td>value</td> | <td>label</td> <td>value</td>)</tr>
  // so here we construct an array, each row shows 2 values
  // and their respective labels
  for (let i = 0; i < filteredArr.length; i += 2)
  {
    tableArr.push([filteredArr[i], filteredArr[i + 1]]);
  }

  return tableArr;
}

let constructColumns = (val:any,key:number) => {
  let item = val[key];
  let label = item['label'];
  let value;
  if (item['displayValue'] && !item['url']){
    value = item['displayValue']
  } else if (!item['displayValue'] && !item['url']){
    value = item['value']
  } else if (item['displayValue'] && item['url']) {
    value = <a href={item['url']}>{item['displayValue']}</a>
  } else if (!item['displayValue'] && item['url']) {
    value = <a href={item['url']}>{item['value']}</a>
  }
  return <><td>{label}</td><td>{value}</td></>
}
/**
 * Displays animal info given a successful state.
 */
const AnimalInfoPane: React.FunctionComponent<PaneProps> = props => {
  const { animalInfo, infoState } = props;

  if (infoState == "waiting") {
    return <div id="animal-info-empty"><EHRSpinner text={'loading...'}/></div>;
  }

  if (infoState == "loading-unsuccess") {
    return <div id="animal-info-empty">Animal not found.</div>;
  }

  if (infoState == "loading") {
    return (
      <div id="animal-info-empty">
        <EHRSpinner text={'loading...'}/>
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
              &nbsp;
            </th>
          </tr>
          </thead>
          <tbody>
          {constructArrayForTable(animalInfo).map((item, index) => {
            return <tr key={index}>{constructColumns(item,0)}{constructColumns(item,1)}</tr>
          }
          )}
          </tbody>
        </Table>
      </div>
    );
  }
};

export default AnimalInfoPane;
