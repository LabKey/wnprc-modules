import * as React from "react";
import * as ReactDom from "react-dom";
import { Table } from "react-bootstrap";
//import './domainproperties.scss';
//import './domainproperties.css';
//import { CollapsiblePanel} from '@labkey/components'
import './index.css'

//export this function to be called in a requiresScript callback
export const renderReport = (id: string, rand: string) => {
  jQuery(() => {
    ReactDom.render(
      <>
        </>

      ,
      document.getElementById("assignments-section"  + id + rand)
    );
  });
}
