import * as React from "react";
import { useEffect, useContext } from "react";
import { AppContext } from "./ContextProvider";
import "../../theme/css/index.css";
import {
  lookupAnimalInfo,
} from "../../query/helpers";
import AnimalInfoPane from "./AnimalInfoPane";

const AbstractContainer: React.FunctionComponent<any> = (props) => {
  const {
    setAnimalInfoExternal,
    animalInfo,
    setAnimalInfoStateExternal,
    animalInfoState,
    updateAnimalInfoCacheExternal,
  } = useContext(AppContext);

  useEffect(()=> {
    lookupAnimalInfo(props.id).then((d) => {
      setAnimalInfoExternal(d);
      setAnimalInfoStateExternal("loading-success");
      updateAnimalInfoCacheExternal(d)
    }).catch((d)=> {
      setAnimalInfoStateExternal("loading-unsuccess");
    });

  },[])

  return (
    <div className={`content-wrapper-body ${false ? "saving" : ""}`}>
      <div className="col-xs-5 panel panel-portal ">
        <AnimalInfoPane animalInfo={animalInfo} infoState={animalInfoState} />
      </div>
      <div className="clear"></div>
    </div>
  );
};

export default AbstractContainer;
