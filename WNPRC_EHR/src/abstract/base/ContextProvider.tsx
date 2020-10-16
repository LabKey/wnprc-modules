import * as React from "react";
import { createContext, useState } from "react";
import {
  ContextProps,
  AnimalInfoProps,
  AnimalInfoStates,
} from "../typings/main";

const AppContext = createContext({} as ContextProps);

const ContextProvider: React.FunctionComponent = ({ children }) => {
  const [animalInfo, setAnimalInfo] = useState<AnimalInfoProps>(null);
  const [animalInfoState, setAnimalInfoState] = useState<AnimalInfoStates>("waiting");
  const [animalInfoCache, updateAnimalInfoCache] = useState<object>();

  const updateAnimalInfoCacheExternal = (ai: object) => {
    let animalInfoCacheNew = {[ai["Id"]]: ai};
    let animalInfoCacheUpdated = {...animalInfoCache, ...animalInfoCacheNew}
    updateAnimalInfoCache(animalInfoCacheUpdated);
  }

  const setAnimalInfoExternal = (ai: AnimalInfoProps) => {
    setAnimalInfo(ai);
  };
  const setAnimalInfoStateExternal = (ais: AnimalInfoStates) => {
    setAnimalInfoState(ais);
  };

  const defaultContext = {
    setAnimalInfoExternal,
    animalInfo,
    setAnimalInfoStateExternal,
    animalInfoState,
    updateAnimalInfoCacheExternal,
    animalInfoCache,
  };

  return (
    <AppContext.Provider value={defaultContext}>{children}</AppContext.Provider>
  );
};

export { AppContext, ContextProvider };
