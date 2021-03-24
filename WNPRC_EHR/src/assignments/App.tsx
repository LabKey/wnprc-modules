import * as React from "react";
import * as ReactDom from "react-dom";
import { Table } from "react-bootstrap";
//import './domainproperties.scss';
//import './domainproperties.css';
import { CollapsiblePanel} from '@labkey/components'
import './index.css'

//export this function to be called in a requiresScript callback
export const renderReport = (id: string, rand: string) => {
  jQuery(() => {
    ReactDom.render(
      <>
        <CollapsiblePanel helpTitle={"Notice"} helpBody={ () => "Animals in this category are not passing the criteria."} title={"Colony Records"} >
          <Table responsive="sm" className="assigns-table" >
            <thead >
            <tr>
              <th>Field</th>
              <th>Criteria</th>
            </tr>
            </thead>
            <tbody>
            <tr>
              <td>Field 1</td>
              <td>Criteria 1</td>
            </tr>
            <tr>
              <td>Field 2</td>
              <td>Criteria 2</td>
            </tr>
            <tr>
              <td>Field 3</td>
              <td>Criteria 3</td>
            </tr>
            <tr>
              <td>Field 4</td>
              <td>Criteria 4</td>
            </tr>
            <tr>
              <td>Field 5</td>
              <td>Criteria 5</td>
            </tr>
            </tbody>
          </Table>
          </CollapsiblePanel>
        <CollapsiblePanel title={"SPI"} helpTitle={"Notice"} helpBody={ () => "Animals in this category are not passing the criteria."}>
          <Table responsive="sm" className="assigns-table" >
            <thead >
            <tr>
              <th>Field</th>
              <th>Criteria</th>
            </tr>
            </thead>
            <tbody>
            <tr>
              <td>Field 1</td>
              <td>Criteria 1</td>
            </tr>
            <tr>
              <td>Field 2</td>
              <td>Criteria 2</td>
            </tr>
            </tbody>
          </Table>

        </CollapsiblePanel>
        </>

      ,
      document.getElementById("assignments-section"  + id + rand)
    );
  });
}
