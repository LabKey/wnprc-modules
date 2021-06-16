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
  let arr = [];
  // each row in the abstract table will have 4 columns,
  // <tr>(<td>label</td> <td>value</td> | <td>label</td> <td>value</td>)</tr>
  // so here we construct an array, each row shows 2 values
  // and their respective labels
  for (let i = 0; i < animalInfo["metaData"]["fields"].length-1; i+=2)
  {
    let firstItemMetadata = animalInfo["metaData"]["fields"][i];
    let secondItemMetadata = animalInfo["metaData"]["fields"][i + 1]
    let firstKey = getNameOfField(firstItemMetadata);
    let secondKey = getNameOfField(secondItemMetadata);
    let firstItemVal = animalInfo["rows"][0][firstKey];
    let secondItemVal = animalInfo["rows"][0][secondKey];

    //cover the case where value could be an array
    if (Array.isArray(firstItemVal) && firstItemVal.length > 0){
      firstItemVal = firstItemVal[0];
    }
    if (Array.isArray(secondItemVal) && secondItemVal.length > 0){
      secondItemVal = secondItemVal[0];
    }

    let items = [];
    items[0] = {
      'label': firstItemMetadata["caption"],
      'displayValue': firstItemVal["displayValue"],
      'url': firstItemVal["url"],
      'value': firstItemVal["value"],
    }
    items[1] = {
      'label': secondItemMetadata["caption"],
      'displayValue': secondItemVal["displayValue"],
      'value': secondItemVal["value"],
      'url': secondItemVal["url"],
    }
    arr.push(items);
  }

  return arr;
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
