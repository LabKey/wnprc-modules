import * as React from "react";
import { useEffect, useContext } from "react";
import { AppContext } from "./ContextProvider";
import "../theme/css/index.css";
import {
  labkeyActionSelectWithPromise,
} from "../../query/helpers";
import AnimalInfoPane from "./AnimalInfoPane";
import {Filter} from '@labkey/api';

const AbstractContainer: React.FunctionComponent<any> = (props) => {
  const {
    setAnimalInfoExternal,
    animalInfo,
    setAnimalInfoStateExternal,
    animalInfoState,
    updateAnimalInfoCacheExternal,
  } = useContext(AppContext);

  useEffect(()=> {
    let config = {
      schemaName: "study",
      queryName: "demographics",
      viewName: "AbstractSingleAnimal",
      sort: "-date",
      filterArray: [Filter.create("Id", props.id, Filter.Types.EQUAL)],
      requiredVersion: 17.1,
    };
    labkeyActionSelectWithPromise(config).then((d) => {
      setAnimalInfoExternal(d);
      setAnimalInfoStateExternal("loading-success");
      updateAnimalInfoCacheExternal(d)
    }).catch((d)=> {
      setAnimalInfoStateExternal("loading-unsuccess");
    });

  },[])

  return (
    <>
      <div className="col-xs-12">
        <AnimalInfoPane animalInfo={animalInfo} infoState={animalInfoState} />
      </div>
      <div className="clear"></div>
    </>
  );
};

export default AbstractContainer;
