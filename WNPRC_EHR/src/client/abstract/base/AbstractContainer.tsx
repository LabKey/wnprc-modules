/*
 * Copyright (c) 2021-2026 Board of Regents of the University of Wisconsin System
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
